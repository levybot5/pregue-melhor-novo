import "server-only";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getPayment, getSubscription } from "./providers/asaas";
import { activateSubscriptionFromPurchase, type PendingPurchaseRow } from "./purchase";

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
  // processada duas vezes (o cálculo de +30 dias em
  // activateSubscriptionFromPurchase é aditivo, então reprocessar
  // duplicaria acesso — ver item 8 do pedido).
  if (purchase.status === "paid") return;

  const admin = getSupabaseAdminClient();
  const paidAt = new Date().toISOString();
  const { error } = await admin
    .from("pending_purchases")
    .update({ status: "paid", paid_at: paidAt, provider_payment_id: paymentId })
    .eq("id", purchase.id);
  if (error) throw error;

  await activateSubscriptionFromPurchase({ ...purchase, status: "paid", paid_at: paidAt });
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
export async function syncSubscriptionCancelled(subscriptionId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("provider_subscription_id", subscriptionId);
  if (error) throw error;
}

// Cobrança de renovação recusada: rebaixa para past_due sem cancelar —
// mesma semântica que já existia para o Mercado Pago.
export async function syncCardPaymentOverdue(paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  if (!payment.subscription) return;

  const admin = getSupabaseAdminClient();
  const { data: existing, error: selectError } = await admin
    .from("subscriptions")
    .select("status")
    .eq("provider_subscription_id", payment.subscription)
    .maybeSingle();
  if (selectError) throw selectError;
  if (!existing || existing.status === "cancelled") return;

  const { error } = await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("provider_subscription_id", payment.subscription);
  if (error) throw error;
}

// Estorno/chargeback: revoga o acesso imediatamente.
export async function syncPaymentRefunded(paymentId: string): Promise<void> {
  const purchase = await findPurchase("provider_payment_id", paymentId);
  const admin = getSupabaseAdminClient();

  if (purchase?.claimed_by_user_id) {
    const { error } = await admin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", purchase.claimed_by_user_id);
    if (error) throw error;
  }

  const payment = await getPayment(paymentId).catch(() => null);
  if (payment?.subscription) {
    await syncSubscriptionCancelled(payment.subscription);
  }
}
