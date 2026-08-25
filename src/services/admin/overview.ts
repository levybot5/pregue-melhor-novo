import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type OverviewStats = {
  active_subscribers: number;
  new_this_month: number;
  cancelled_this_month: number;
  past_due_count: number;
  expired_unrenewed_count: number;
  mrr: number;
  revenue_this_month: number;
  pix_active_count: number;
  card_active_count: number;
};

// A RPC já confere is_current_user_admin() por dentro (defesa em
// profundidade) — não repete a checagem aqui, mas nunca confia só no
// gate da página que chamou isto.
export async function getOverviewStats(): Promise<OverviewStats> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_overview_stats").single();
  if (error) throw error;
  return data as OverviewStats;
}
