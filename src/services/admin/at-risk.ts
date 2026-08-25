import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type AtRiskSignal =
  | "inactive_14d"
  | "pix_expiring_soon"
  | "pix_expired_unrenewed"
  | "card_past_due"
  | "signed_up_never_generated";

export type AtRiskSubscriber = {
  user_id: string;
  email: string;
  signal: AtRiskSignal;
  detail: string;
};

// Sinais operacionais, nunca certeza de churn — a UI que consome isto
// precisa rotular como tal, nunca "vai cancelar".
export async function getAtRiskSubscribers(): Promise<AtRiskSubscriber[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_at_risk_subscribers");
  if (error) throw error;
  return (data as AtRiskSubscriber[] | null) ?? [];
}
