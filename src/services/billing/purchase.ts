import "server-only";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getCurrentUser } from "@/services/auth";
import { getOrCreateDeviceId } from "./device";
import {
  createAsaasCustomer,
  createPixPayment,
  getPixQrCode,
  createCardCheckout as createAsaasCardCheckout,
} from "./providers/asaas";
import { recordSubscriptionEvent, type SubscriptionStatusValue } from "./subscription-events";
import { grantKitAccess } from "./kit";
import { PLANS, KIT_PRICE, KIT_LABEL, PRO_PRICE, isPlanId, type PlanId } from "./pricing";

// Ponto único que a UI chama para iniciar um pagamento ou reivindicar
// uma compra já paga. Nada fora de src/services/billing deve importar
// diretamente de ./providers/asaas — nem a UI, nem as Server Actions
// das páginas de checkout.

export type PaymentMethod = "pix" | "credit_card";

export type PendingPurchaseRow = {
  id: string;
  device_id: string;
  payment_method: PaymentMethod;
  provider_customer_id: string | null;
  provider_payment_id: string | null;
  provider_subscription_id: string | null;
  provider_checkout_id: string | null;
  amount: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  plan_id: PlanId | null;
  duration_days: number | null;
  includes_kit: boolean;
  paid_at: string | null;
  access_expires_at: string | null;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  created_at: string;
  fbc: string | null;
  fbp: string | null;
};

async function insertPendingPurchase(
  paymentMethod: PaymentMethod,
  deviceId: string,
  claimedByUserId: string | null,
  options?: {
    amount?: number;
    planId?: PlanId;
    durationDays?: number;
    includesKit?: boolean;
    fbc?: string;
    fbp?: string;
  },
): Promise<PendingPurchaseRow> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("pending_purchases")
    .insert({
      device_id: deviceId,
      payment_method: paymentMethod,
      amount: options?.amount ?? PRO_PRICE,
      plan_id: options?.planId ?? null,
      duration_days: options?.durationDays ?? null,
      includes_kit: options?.includesKit ?? false,
      claimed_by_user_id: claimedByUserId,
      fbc: options?.fbc ?? null,
      fbp: options?.fbp ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PendingPurchaseRow;
}

export type PixPurchaseInput = {
  name: string;
  cpfCnpj: string;
  email?: string;
  planId: PlanId;
  includeKit: boolean;
  // Cookies do Facebook Pixel (_fbc/_fbp), lidos no navegador na hora
  // do checkout — ver PagarForm.tsx. Guardados na compra pra o webhook
  // conseguir mandar pra Conversions API depois, quando o PIX
  // confirmar (a pessoa já pode ter saído do site nesse momento).
  fbc?: string;
  fbp?: string;
};

export type PixPurchaseResult = {
  purchaseId: string;
  qrCodeBase64: string;
  copyPaste: string;
  expirationDate: string;
};

// O formulário (PagarForm.tsx) já valida nome/CPF antes de chamar a
// action, mas Server Actions são endpoints públicos — quem chamar
// createPixPurchaseAction() diretamente (sem passar pelo form) pula
// essa validação do cliente. Revalida aqui, no servidor, antes de
// gastar uma chamada à API da Asaas com dado inválido.
export class InvalidPixPurchaseInputError extends Error {}

const PIX_NAME_MAX_LENGTH = 100;

function validatePixPurchaseInput(input: PixPurchaseInput): void {
  const name = input.name.trim();
  if (name.length < 3) {
    throw new InvalidPixPurchaseInputError("Digite seu nome completo.");
  }
  if (name.length > PIX_NAME_MAX_LENGTH) {
    throw new InvalidPixPurchaseInputError(`Use um nome com até ${PIX_NAME_MAX_LENGTH} caracteres.`);
  }

  const digits = input.cpfCnpj.replace(/\D/g, "");
  if (digits.length !== 11 && digits.length !== 14) {
    throw new InvalidPixPurchaseInputError("Digite um CPF ou CNPJ válido.");
  }
}

// Cobrança PIX DIRETA (nunca Pix Automático — item 21 do pedido): só
// pede nome + CPF (exigência mínima da Asaas para criar um cliente),
// sem endereço nem celular — o QR code e o copia-e-cola aparecem na
// nossa própria tela. Se o visitante já estiver logado, a compra já
// nasce vinculada à conta (item 14: não pede cadastro de novo depois).
export async function createPixPurchase(input: PixPurchaseInput): Promise<PixPurchaseResult> {
  validatePixPurchaseInput(input);
  if (!isPlanId(input.planId)) {
    throw new InvalidPixPurchaseInputError("Plano inválido.");
  }

  const plan = PLANS[input.planId];
  const amount = Math.round((plan.price + (input.includeKit ? KIT_PRICE : 0)) * 100) / 100;
  const description = input.includeKit
    ? `Pregue Melhor Pro ${plan.label} + ${KIT_LABEL} — ${plan.days} dias de acesso`
    : `Pregue Melhor Pro ${plan.label} — ${plan.days} dias de acesso`;

  const deviceId = await getOrCreateDeviceId();
  const user = await getCurrentUser();

  const purchase = await insertPendingPurchase("pix", deviceId, user?.id ?? null, {
    amount,
    planId: plan.id,
    durationDays: plan.days,
    includesKit: input.includeKit,
    fbc: input.fbc,
    fbp: input.fbp,
  });

  const customer = await createAsaasCustomer({
    name: input.name,
    cpfCnpj: input.cpfCnpj,
    email: input.email,
    externalReference: purchase.id,
  });

  const payment = await createPixPayment({
    customerId: customer.id,
    value: amount,
    externalReference: purchase.id,
    description,
  });

  const admin = getSupabaseAdminClient();
  const { error: updateError } = await admin
    .from("pending_purchases")
    .update({ provider_customer_id: customer.id, provider_payment_id: payment.id })
    .eq("id", purchase.id);
  if (updateError) throw updateError;

  const qrCode = await getPixQrCode(payment.id);

  return {
    purchaseId: purchase.id,
    qrCodeBase64: qrCode.encodedImage,
    copyPaste: qrCode.payload,
    expirationDate: qrCode.expirationDate,
  };
}

export type CardCheckoutResult = {
  purchaseId: string;
  checkoutUrl: string;
};

// Assinatura mensal recorrente via checkout HOSPEDADO da Asaas — nosso
// servidor nunca recebe dado de cartão (item 2/9 do pedido). Este sim
// deixa a Asaas coletar tudo (nome, CPF, endereço, celular) na página
// dela, porque não tem como fugir disso com cartão.
export async function createCardCheckout(): Promise<CardCheckoutResult> {
  const deviceId = await getOrCreateDeviceId();
  const user = await getCurrentUser();
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new Error("Asaas não configurado: defina APP_URL em .env.local");
  }

  const purchase = await insertPendingPurchase("credit_card", deviceId, user?.id ?? null);

  const checkout = await createAsaasCardCheckout({
    externalReference: purchase.id,
    successUrl: `${appUrl}/planos/retorno?purchase=${purchase.id}`,
    cancelUrl: `${appUrl}/planos/pagar`,
    expiredUrl: `${appUrl}/planos/pagar`,
  });

  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("pending_purchases")
    .update({ provider_checkout_id: checkout.id })
    .eq("id", purchase.id);
  if (error) throw error;

  return { purchaseId: purchase.id, checkoutUrl: checkout.link };
}

export type PurchaseStatusResult = {
  status: PendingPurchaseRow["status"];
  claimedByCurrentUser: boolean;
  needsAccount: boolean;
};

// Usado pela tela de espera do PIX (polling) e pelo retorno do
// checkout de cartão. Só revela o estado de uma compra para quem tem
// o mesmo device_id que a criou, ou para o usuário que já a
// reivindicou — nunca para qualquer id adivinhado (item 13).
export async function getPurchaseStatus(purchaseId: string): Promise<PurchaseStatusResult | null> {
  const purchase = await fetchOwnedPurchase(purchaseId);
  if (!purchase) return null;

  const user = await getCurrentUser();
  const claimedByCurrentUser = Boolean(user && purchase.claimed_by_user_id === user.id);

  return {
    status: purchase.status,
    claimedByCurrentUser,
    needsAccount: purchase.status === "paid" && !purchase.claimed_by_user_id,
  };
}

async function fetchOwnedPurchase(purchaseId: string): Promise<PendingPurchaseRow | null> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("pending_purchases")
    .select()
    .eq("id", purchaseId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const purchase = data as PendingPurchaseRow;
  const deviceId = await getOrCreateDeviceId();
  const user = await getCurrentUser();
  const ownedByDevice = purchase.device_id === deviceId;
  const ownedByUser = Boolean(user && purchase.claimed_by_user_id === user.id);

  // Não vaza o estado de uma compra de outro dispositivo/conta — quem
  // não é dono só recebe "não encontrada", igual a getContentById().
  if (!ownedByDevice && !ownedByUser) return null;
  return purchase;
}

export type ClaimPurchaseResult = { success: true } | { success: false; message: string };

// Vincula uma compra PAGA à conta do usuário logado — no máximo uma
// vez (item 13: reutilizar o mesmo pagamento pra outra conta nunca é
// permitido). Chamada logo após cadastro/login quando havia uma compra
// pendente de vínculo, ou automaticamente pelo webhook quando a compra
// já nasceu vinculada (usuário já estava logado ao pagar).
export async function claimPendingPurchase(purchaseId: string): Promise<ClaimPurchaseResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Você precisa entrar para vincular este pagamento." };
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("pending_purchases")
    .select()
    .eq("id", purchaseId)
    .maybeSingle();
  if (error) throw error;
  const purchase = data as PendingPurchaseRow | null;

  if (!purchase) {
    return { success: false, message: "Pagamento não encontrado." };
  }
  if (purchase.claimed_by_user_id === user.id) {
    // Já vinculada a este mesmo usuário — normalmente idempotente (ex.:
    // duplo clique). Mas o vínculo (claimed_by_user_id) e a ativação de
    // fato (upsert em subscriptions) são dois passos separados — se o
    // segundo falhou antes (ex.: erro de banco), a pessoa fica com a
    // compra "vinculada" mas sem Pro. Detecta esse caso e tenta ativar
    // de novo; só pula quando já existe uma assinatura ativa de
    // verdade, pra nunca somar 30 dias duas vezes na mesma compra.
    const { data: existingSub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingSub?.status !== "active") {
      await activateSubscriptionFromPurchase(purchase);
    }
    return { success: true };
  }
  if (purchase.claimed_by_user_id) {
    return { success: false, message: "Este pagamento já foi vinculado a outra conta." };
  }
  if (purchase.status !== "paid") {
    return { success: false, message: "Ainda estamos confirmando seu pagamento." };
  }

  const deviceId = await getOrCreateDeviceId();
  if (purchase.device_id !== deviceId) {
    return { success: false, message: "Este pagamento pertence a outro dispositivo." };
  }

  const { error: claimError } = await admin
    .from("pending_purchases")
    .update({ claimed_by_user_id: user.id, claimed_at: new Date().toISOString() })
    .eq("id", purchase.id)
    .is("claimed_by_user_id", null); // guarda extra contra corrida: só atualiza se ainda não tinha dono
  if (claimError) throw claimError;

  await activateSubscriptionFromPurchase({ ...purchase, claimed_by_user_id: user.id });

  return { success: true };
}

// Ativa/renova a assinatura em `subscriptions` (fonte única de verdade
// de "é Pro" — item 15) a partir de uma pending_purchase já paga E já
// vinculada a um usuário. Chamada em dois pontos: aqui em
// claimPendingPurchase(), e pelo webhook quando a compra já nasceu
// pré-vinculada (usuário logado no momento da compra).
export async function activateSubscriptionFromPurchase(
  purchase: PendingPurchaseRow,
  cardCurrentPeriodEnd?: string,
): Promise<void> {
  if (!purchase.claimed_by_user_id) return;

  const admin = getSupabaseAdminClient();
  const now = new Date();
  const userId = purchase.claimed_by_user_id;
  // Linhas antigas (antes da migration de Trimestral) e compras de
  // cartão sempre têm duration_days null — 30 reproduz exatamente o
  // comportamento de antes.
  const accessDays = purchase.duration_days ?? 30;

  // Busca sempre (não só no ramo Pix, como antes) — precisamos do
  // status anterior pra saber se isto é uma ativação nova ou uma
  // renovação, só pra fins de trilha de auditoria (subscription_events,
  // usada pelo painel /admin). Não muda nada no cálculo de datas.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  let currentPeriodEnd: string;
  if (purchase.payment_method === "pix") {
    // Renovar antes de vencer nunca faz perder os dias que sobravam
    // (item 8 do pedido): a base é o maior entre "agora" e o
    // vencimento atual, e só depois somamos os dias da compra —
    // funciona igual pra Mensal, Trimestral, ou trocar de um pro
    // outro, sem nenhum caso especial.
    const existingEnd = existing?.current_period_end
      ? new Date(existing.current_period_end as string)
      : null;
    const base = existingEnd && existingEnd > now ? existingEnd : now;
    const newEnd = new Date(base.getTime() + accessDays * 24 * 60 * 60 * 1000);
    currentPeriodEnd = newEnd.toISOString();
  } else {
    // Cartão: a Asaas é quem manda no calendário de cobrança — o
    // webhook já buscou o nextDueDate real da assinatura na API antes
    // de chamar esta função.
    currentPeriodEnd = cardCurrentPeriodEnd ?? new Date(now.getTime() + accessDays * 24 * 60 * 60 * 1000).toISOString();
  }

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      // Fallback "pro" preserva o texto de exibição de linhas antigas
      // (de antes de existir plan_id) e de compras via cartão.
      plan: purchase.plan_id ?? "pro",
      status: "active",
      payment_method: purchase.payment_method,
      provider: "asaas",
      provider_subscription_id: purchase.provider_subscription_id,
      current_period_start: purchase.paid_at ?? now.toISOString(),
      current_period_end: currentPeriodEnd,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;

  // Kit é independente do ciclo de assinatura, mas nasce do MESMO
  // pagamento — concedido aqui (não só no webhook) porque este é o
  // único ponto por onde TODA ativação passa, inclusive quando o
  // pagamento aconteceu sem conta e foi reivindicado depois em
  // claimPendingPurchase(). Idempotente (upsert com ignoreDuplicates),
  // seguro chamar de novo em qualquer retry.
  if (purchase.includes_kit) {
    await grantKitAccess(admin, userId);
  }

  const previousStatus = (existing?.status as SubscriptionStatusValue | undefined) ?? null;
  await recordSubscriptionEvent(admin, {
    userId,
    eventType: previousStatus === "active" ? "renewed" : "activated",
    previousStatus,
    newStatus: "active",
    paymentMethod: purchase.payment_method,
    amount: purchase.amount,
    occurredAt: now.toISOString(),
  });
}
