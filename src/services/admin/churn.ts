import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type ChurnBreakdown = {
  voluntary_cancel: number;
  card_past_due: number;
  pix_non_renewal: number;
  refunded: number;
};

export type ChurnStats = {
  active_at_period_start_30d: number;
  active_at_period_start_month: number;
  churn_last_30_days_pct: number | null;
  churn_this_month_pct: number | null;
  breakdown_last_30_days: ChurnBreakdown;
  breakdown_this_month: ChurnBreakdown;
  note: string;
};

// Fórmulas literais do pedido:
//   churn = (clientes perdidos no período) / (clientes ativos no início do período)
//   retenção = (clientes do início que continuam ativos) / (clientes ativos no início do período)
export async function getChurnStats(): Promise<ChurnStats> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_churn_stats");
  if (error) throw error;
  return data as ChurnStats;
}
