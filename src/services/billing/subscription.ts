import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type SubscriptionStatus = "active" | "inactive" | "past_due" | "cancelled";

export type Subscription = {
  plan: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
};

// RLS (select_own_subscription) já garante isolamento — não precisa
// filtrar por usuário aqui além do .eq, que também documenta a intenção.
export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_start, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Subscription | null;
}

// Sem linha de assinatura = tratado como não ativo, nunca como erro.
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const subscription = await getCurrentSubscription(userId);
  return subscription?.status === "active";
}
