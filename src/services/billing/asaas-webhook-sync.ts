import "server-only";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getPayment, getSubscription, AsaasApiError } from "./providers/asaas";
import { activateSubscriptionFromPurchase, type PendingPurchaseRow } from "./purchase";
import { recordSubscriptionEvent, type SubscriptionStatusValue } from "./subscription-events";
import { grantKitAccess, revokeKitAccess } from "./kit";
import { grantEbookAccess, revokeEbookAccess } from "./ebook";
import { sendPurchaseEvent } from "@/services/marketing/meta-capi";

// E-mail só existe pra quem já tinha conta no momento da compra
// (claimed_by_user_id) — PIX anônimo não coleta e-mail no formulário
// hoje. Sem e-mail o evento ainda vai, só com match mais fraco
// (fbc/fbp), então nunca é motivo pra não mandar.
async function getPurchaserEmail(userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

// Único lugar do app que ESCREVE em pending_purchases/subscriptions a
// partir de um evento Asaas — só chamado pelo webhook, com o client
// admin. Todo handler REBUSCA o estado na API da Asaas antes de
// gravar (nunca confia no corpo da notificação sozinho — mesma regra
// já usada para o Mercado Pago).

async function findPurchase(
  column: "provider_payment_id" | "provider_subscription_id" | "id",
  value: string,
): Promise<PendingPurchaseRow | null> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("pending_purchases")
    .select()
    .eq(column, value)
    .maybeSingle();
  if (error) throw error;
  return data as PendingPurchaseRow | null;
}

// PIX: só PAYMENT_RECEIVED libera acesso (dinheiro já disponível na
// conta Asaas — ver services/billing/providers/asaas/status-mapping.ts).
// provider_payment_id já é conhecido desde a criação da cobrança
// (createPixPurchase), então o achado normal é por ele; o fallback por
// externalReference é só rede de segurança.
export async function syncPixPaymentReceived(paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  if (payment.billingType !== "PIX" || payment.status !== "RECEIVED") return;

  let purchase = await findPurchase("provider_payment_id", paymentId);
  if (!purchase && payment.externalReference) {
    purchase = await findPurchase("id", payment.externalReference);
  }
  if (!purchase) {
    console.error(`[ASAAS-WEBHOOK] PIX recebido sem pending_purchase correspondente: ${paymentId}`);
    return;
  }
  if (purchase.payment_method !== "pix") return;

  // Idempotência: uma cobrança PIX confirmada nunca deve ser
  // processada duas vezes (o cálculo de dias em
  // activateSubscriptionFromPurchase é aditivo, então reprocessar
  // duplicaria acesso — ver item 8 do pedido). Mas se esta compra
  // incluía o Kit e uma tentativa anterior ativou a assinatura e falhou
  // DEPOIS, dentro de grantKitAccess (erro transitório), o retry da
  // Asaas precisa poder completar só essa parte — grantKitAccess é
  // idempotente (upsert + ignoreDuplicates), seguro chamar de novo.
  if (purchase.status === "paid") {
    if (purchase.includes_kit && purchase.claimed_by_user_id) {
      await grantKitAccess(getSupabaseAdminClient(), purchase.claimed_by_user_id);
    }
    if (purchase.includes_ebook && purchase.claimed_by_user_id) {
      await grantEbookAccess(getSupabaseAdminClient(), purchase.claimed_by_user_id);
    }
    return;
  }

  const admin = getSupabaseAdminClient();
  const paidAt = new Date().toISOString();
  const { error } = await admin
    .from("pending_purchases")
    .update({ status: "paid", paid_at: paidAt, provider_payment_id: paymentId })
    .eq("id", purchase.id);
  if (error) throw error;

  await activateSubscriptionFromPurchase({ ...purchase, status: "paid", paid_at: paidAt });

  // Só na primeira confirmação (não no reprocessamento acima) — evento
  // Purchase pra Meta Ads, com o e-mail (se a compra já tinha dono),
  // fbc/fbp salvos no checkout. Nunca bloqueia a liberação de acesso:
  // sendPurchaseEvent nunca lança.
  const email = await getPurchaserEmail(purchase.claimed_by_user_id);
  await sendPurchaseEvent({
    value: purchase.amount,
    eventId: purchase.id,
    email,
    fbc: purchase.fbc,
    fbp: purchase.fbp,
    clientIp: purchase.client_ip,
    clientUserAgent: purchase.client_user_agent,
  });
}

// Checkout hospedado (Pix OU Cartão, cobrança única — ver
// createHostedCheckout): a linha nasce com payment_method NULO porque
// só a Asaas sabe qual forma a pessoa vai escolher. Casada só por
// externalReference (nunca tínhamos um provider_payment_id de
// antemão, diferente do Pix direto). Só age se ainda não foi
// resolvida (payment_method null + provider_checkout_id preenchido) —
// assim nunca pisa nos outros dois handlers, que casam por
// provider_payment_id/provider_subscription_id.
export async function syncHostedCheckoutPaymentReceived(paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  const isPix = payment.billingType === "PIX" && payment.status === "RECEIVED";
  const isCard = payment.billingType === "CREDIT_CARD" && payment.status === "CONFIRMED";
  if (!isPix && !isCard) return;
  if (!payment.externalReference) return;

  const purchase = await findPurchase("id", payment.externalReference);
  if (!purchase || !purchase.provider_checkout_id) return;

  const resolvedMethod = isPix ? "pix" : "credit_card";

  if (purchase.status === "paid") {
    // Idempotência (mesma lógica do Pix direto) — reprocessar não pode
    // duplicar acesso, só garantir que o Kit (se houver) foi mesmo
    // concedido numa tentativa anterior que tenha falhado no meio.
    if (purchase.includes_kit && purchase.claimed_by_user_id) {
      await grantKitAccess(getSupabaseAdminClient(), purchase.claimed_by_user_id);
    }
    if (purchase.includes_ebook && purchase.claimed_by_user_id) {
      await grantEbookAccess(getSupabaseAdminClient(), purchase.claimed_by_user_id);
    }
    return;
  }
  if (purchase.payment_method !== null) return; // já resolvida por outro evento

  const admin = getSupabaseAdminClient();
  const paidAt = new Date().toISOString();
  const { error } = await admin
    .from("pending_purchases")
    .update({
      status: "paid",
      paid_at: paidAt,
      payment_method: resolvedMethod,
      provider_payment_id: paymentId,
    })
    .eq("id", purchase.id);
  if (error) throw error;

  await activateSubscriptionFromPurchase({
    ...purchase,
    status: "paid",
    paid_at: paidAt,
    payment_method: resolvedMethod,
  });

  const email = await getPurchaserEmail(purchase.claimed_by_user_id);
  await sendPurchaseEvent({
    value: purchase.amount,
    eventId: purchase.id,
    email,
    fbc: purchase.fbc,
    fbp: purchase.fbp,
    clientIp: purchase.client_ip,
    clientUserAgent: purchase.client_user_agent,
  });
}

// Cartão: PAYMENT_CONFIRMED libera/renova. Cobre tanto a primeira
// cobrança da assinatura (achada pelo externalReference do checkout)
// quanto renovações mensais (achadas pelo id da assinatura, já
// gravado na primeira vez) — sempre define current_period_end como o
// nextDueDate real da Asaas, nunca soma dias por conta própria, então
// reprocessar o mesmo evento não duplica acesso.
export async function syncCardPaymentConfirmed(paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  if (payment.billingType !== "CREDIT_CARD" || !payment.subscription) return;
  if (payment.status !== "CONFIRMED" && payment.status !== "RECEIVED") return;

  let purchase = await findPurchase("provider_subscription_id", payment.subscription);
  if (!purchase && payment.externalReference) {
    purchase = await findPurchase("id", payment.externalReference);
  }
  if (!purchase) {
    console.error(`[ASAAS-WEBHOOK] pagamento de cartão sem pending_purchase: ${paymentId}`);
    return;
  }
  if (purchase.payment_method !== "credit_card") return;

  const subscription = await getSubscription(payment.subscription);

  const admin = getSupabaseAdminClient();
  if (purchase.status !== "paid") {
    const paidAt = new Date().toISOString();
    const { error } = await admin
      .from("pending_purchases")
      .update({
        status: "paid",
        paid_at: paidAt,
        provider_subscription_id: payment.subscription,
      })
      .eq("id", purchase.id);
    if (error) throw error;
    purchase = {
      ...purchase,
      status: "paid",
      paid_at: paidAt,
      provider_subscription_id: payment.subscription,
    };
  }

  await activateSubscriptionFromPurchase(purchase, subscription.nextDueDate);
}

// Assinatura cancelada/inativada na Asaas (usuário cancelou, ou várias
// tentativas de cobrança falharam) — revoga o Pro sem apagar nada mais
// (Biblioteca, favoritos, progresso da Academia continuam intactos).
//
// Rebusca a verdade na Asaas antes de gravar — diferente do que fazia
// antes (confiava só no id do corpo do webhook). Isso fecha dois
// problemas de uma vez: um evento repetido/fora de ordem nunca cancela
// uma assinatura que já voltou a ficar ativa (rebusca sempre pega o
// estado ATUAL, nunca o do momento do evento), e alinha este handler
// com a mesma regra "sempre rebuscar" que os outros já seguiam.
export async function syncSubscriptionCancelled(subscriptionId: string): Promise<void> {
  const admin = getSupabaseAdminClient();

  const { data: existing, error: selectError } = await admin
    .from("subscriptions")
    .select("user_id, status, payment_method")
    .eq("provider_subscription_id", subscriptionId)
    .maybeSingle();
  if (selectError) throw selectError;
  if (!existing || existing.status === "cancelled") return;

  let stillActive: boolean;
  try {
    const subscription = await getSubscription(subscriptionId);
    stillActive = subscription.status === "ACTIVE";
  } catch (error) {
    if (error instanceof AsaasApiError && error.status === 404) {
      // Assinatura não existe mais na Asaas (SUBSCRIPTION_DELETED) —
      // confirma o cancelamento.
      stillActive = false;
    } else {
      throw error;
    }
  }
  if (stillActive) return;

  const { error } = await admin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("provider_subscription_id", subscriptionId);
  if (error) throw error;

  await recordSubscriptionEvent(admin, {
    userId: existing.user_id,
    eventType: "cancelled",
    previousStatus: existing.status as SubscriptionStatusValue,
    newStatus: "cancelled",
    paymentMethod: existing.payment_method,
  });
}

// Cobrança de renovação recusada: rebaixa para past_due sem cancelar —
// mesma semântica que já existia para o Mercado Pago.
export async function syncCardPaymentOverdue(paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  // Antes só checava payment.subscription existir — qualquer evento com
  // pagamento ligado a uma assinatura rebaixava pra past_due, mesmo que
  // esse pagamento específico não estivesse realmente vencido. Agora só
  // rebaixa quando o status real do pagamento é OVERDUE.
  if (!payment.subscription || payment.status !== "OVERDUE") return;

  const admin = getSupabaseAdminClient();
  const { data: existing, error: selectError } = await admin
    .from("subscriptions")
    .select("user_id, status, payment_method")
    .eq("provider_subscription_id", payment.subscription)
    .maybeSingle();
  if (selectError) throw selectError;
  if (!existing || existing.status === "cancelled") return;

  const { error } = await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("provider_subscription_id", payment.subscription);
  if (error) throw error;

  await recordSubscriptionEvent(admin, {
    userId: existing.user_id,
    eventType: "past_due",
    previousStatus: existing.status as SubscriptionStatusValue,
    newStatus: "past_due",
    paymentMethod: existing.payment_method,
  });
}

// Estorno/chargeback: revoga o acesso imediatamente.
export async function syncPaymentRefunded(paymentId: string): Promise<void> {
  const purchase = await findPurchase("provider_payment_id", paymentId);
  const admin = getSupabaseAdminClient();
  const now = new Date().toISOString();

  if (purchase?.claimed_by_user_id) {
    const { data: existing, error: selectError } = await admin
      .from("subscriptions")
      .select("status, payment_method")
      .eq("user_id", purchase.claimed_by_user_id)
      .maybeSingle();
    if (selectError) throw selectError;

    if (existing && existing.status !== "cancelled") {
      // Zera current_period_end JUNTO com o status: sem isso, uma
      // reativação por Pix depois do estorno usaria o vencimento antigo
      // (ainda no futuro) como base do "max(existente, agora) + 30" em
      // activateSubscriptionFromPurchase, somando 30 dias em cima de um
      // período já estornado.
      const { error } = await admin
        .from("subscriptions")
        .update({ status: "cancelled", current_period_end: now })
        .eq("user_id", purchase.claimed_by_user_id);
      if (error) throw error;

      await recordSubscriptionEvent(admin, {
        userId: purchase.claimed_by_user_id,
        eventType: "refunded",
        previousStatus: existing.status as SubscriptionStatusValue,
        newStatus: "cancelled",
        paymentMethod: existing.payment_method,
        amount: purchase.amount,
        occurredAt: now,
      });
    }

    // Se esta compra específica incluía o Kit, o estorno remove também
    // o acesso permanente — o pagamento que concedeu o entitlement foi
    // desfeito.
    if (purchase.includes_kit) {
      await revokeKitAccess(admin, purchase.claimed_by_user_id);
    }
    // Mesma lógica pro ebook — inclusive quando a compra é avulsa
    // (is_ebook_only), sem assinatura nenhuma envolvida.
    if (purchase.includes_ebook) {
      await revokeEbookAccess(admin, purchase.claimed_by_user_id);
    }
  }

  const payment = await getPayment(paymentId).catch(() => null);
  if (payment?.subscription) {
    await syncSubscriptionCancelled(payment.subscription);
  }
}
