import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionEventType = "activated" | "renewed" | "past_due" | "cancelled" | "refunded";

export type SubscriptionStatusValue = "active" | "inactive" | "past_due" | "cancelled";

// Trilha de auditoria pra métricas (churn, MRR-ao-longo-do-tempo,
// coorte — ver painel /admin), nunca pra decidir "é Pro" (isso continua
// sendo isSubscriptionActive). Nunca lança: uma falha aqui não pode
// reverter uma ativação nem travar um webhook que já gravou o estado
// real em subscriptions — o dinheiro/acesso sempre vem antes do log.
export async function recordSubscriptionEvent(
  admin: SupabaseClient,
  params: {
    userId: string;
    eventType: SubscriptionEventType;
    previousStatus: SubscriptionStatusValue | null;
    newStatus: SubscriptionStatusValue;
    paymentMethod: "pix" | "credit_card" | null;
    amount?: number | null;
    occurredAt?: string;
  },
): Promise<void> {
  const { error } = await admin.from("subscription_events").insert({
    user_id: params.userId,
    event_type: params.eventType,
    previous_status: params.previousStatus,
    new_status: params.newStatus,
    payment_method: params.paymentMethod,
    amount: params.amount ?? null,
    occurred_at: params.occurredAt ?? new Date().toISOString(),
  });
  if (error) {
    console.error("[SUBSCRIPTION-EVENTS] falha ao registrar evento (não bloqueia o caminho principal):", error);
  }
}
