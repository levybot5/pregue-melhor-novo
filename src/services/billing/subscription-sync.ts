import "server-only";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getPreapproval, fetchPaymentSafely, mapPreapprovalStatus } from "./providers/mercadopago";

// Único lugar do app que ESCREVE em subscriptions (fora do SQL manual
// usado em desenvolvimento). Só é chamado pelo webhook, com o client
// admin — nunca a partir de uma ação disparada pelo navegador.
//
// Idempotência: sempre buscamos o estado atual e completo na API da
// MP (nunca confiamos no corpo do webhook) e fazemos UPSERT por
// user_id (definindo o estado absoluto, não incrementando nada).
// Reprocessar a mesma notificação várias vezes produz o mesmo
// resultado — não duplica linha, não duplica cobrança, não mexe em
// usage_events.
export async function syncSubscriptionFromPreapproval(preapprovalId: string): Promise<void> {
  const preapproval = await getPreapproval(preapprovalId);

  const userId = preapproval.external_reference;
  if (!userId) {
    console.error(
      "[MP-WEBHOOK] preapproval sem external_reference, ignorando:",
      preapprovalId,
    );
    return;
  }

  const status = mapPreapprovalStatus(preapproval.status);

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "pro",
      status,
      provider: "mercadopago",
      provider_subscription_id: preapproval.id ?? preapprovalId,
      provider_plan_id: process.env.MERCADOPAGO_PLAN_ID ?? null,
      current_period_start: preapproval.date_created ?? null,
      current_period_end: preapproval.next_payment_date ?? null,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
}

// Evento secundário: uma cobrança recorrente foi rejeitada. Só
// rebaixa para past_due se já conhecíamos essa assinatura e ela não
// está cancelada — nunca reabre nem inventa uma assinatura nova aqui.
export async function syncPastDueFromRejectedPayment(paymentId: string): Promise<void> {
  const payment = await fetchPaymentSafely(paymentId);
  if (!payment || payment.status !== "rejected") {
    return;
  }

  const preapprovalId = extractPreapprovalId(payment as unknown as Record<string, unknown>);
  if (!preapprovalId) {
    console.error(
      "[MP-WEBHOOK] payment rejeitado sem preapproval_id legível, ignorando:",
      paymentId,
    );
    return;
  }

  const admin = getSupabaseAdminClient();
  const { data: existing, error: selectError } = await admin
    .from("subscriptions")
    .select("status")
    .eq("provider_subscription_id", preapprovalId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (!existing || existing.status === "cancelled") {
    return;
  }

  const { error } = await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("provider_subscription_id", preapprovalId);

  if (error) throw error;
}

// O SDK não tipa "preapproval_id" na resposta de Payment (o campo
// existe na API real para pagamentos de assinatura, mas não no
// modelo TypeScript do SDK). Lemos de forma defensiva; se não vier,
// simplesmente não agimos — o subscription_preapproval continua
// sendo a fonte de verdade principal.
function extractPreapprovalId(payment: Record<string, unknown>): string | null {
  const value = payment["preapproval_id"];
  return typeof value === "string" ? value : null;
}
