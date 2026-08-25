import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type SubscriptionStatus = "active" | "inactive" | "past_due" | "cancelled";

export type Subscription = {
  plan: string;
  status: SubscriptionStatus;
  payment_method: "pix" | "credit_card" | null;
  current_period_start: string | null;
  current_period_end: string | null;
};

// RLS (select_own_subscription) já garante isolamento — não precisa
// filtrar por usuário aqui além do .eq, que também documenta a intenção.
export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, status, payment_method, current_period_start, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Subscription | null;
}

// Sem linha de assinatura = tratado como não ativo, nunca como erro.
// status="active" sozinho não basta: PIX não tem cobrança automática
// (item 7/21 do pedido), então um acesso pode ter status="active" no
// banco e ainda assim já ter vencido — current_period_end é quem
// decide de fato. Vale também para cartão (nunca deveria ficar
// desatualizado, já que os webhooks mantêm current_period_end em dia,
// mas a checagem é a mesma pros dois — "não criar duas formas
// diferentes de verificar 'é Pro'", item 15).
//
// "cancelled" e "past_due" NÃO cortam acesso na hora — a pessoa já
// pagou aquele período, continua Pro até current_period_end vencer de
// verdade (cancelamento de renovação ≠ revogação imediata). Revogação
// imediata (estorno/chargeback) não é um estado à parte: funciona
// zerando current_period_end no momento do evento (ver
// syncPaymentRefunded), então cai nesta mesma checagem de data — sem
// precisar de um "cancel_at_period_end" separado. Só "inactive" (nunca
// assinou) é negado incondicionalmente.
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const subscription = await getCurrentSubscription(userId);
  if (!subscription || subscription.status === "inactive") return false;

  if (subscription.status === "active" && !subscription.current_period_end) {
    return true;
  }

  return Boolean(subscription.current_period_end) && new Date(subscription.current_period_end as string) > new Date();
}

// Só faz sentido para PIX — cartão renova sozinho, não precisa de
// lembrete (item 8 do pedido de checkout Asaas). Fora de page.tsx de
// propósito: Server Components não podem chamar Date.now()/new Date()
// diretamente no corpo (regra de pureza do React) — toda lógica de
// data mora na camada de serviço.
export function getDaysUntilExpiry(subscription: Subscription | null): number | null {
  if (subscription?.payment_method !== "pix" || !subscription.current_period_end) {
    return null;
  }
  const diffMs = new Date(subscription.current_period_end).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
