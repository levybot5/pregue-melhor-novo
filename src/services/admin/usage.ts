import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type UsageStats = {
  generations_last_7_days: number;
  generations_last_30_days: number;
  active_users_last_7_days: number;
  active_users_last_30_days: number;
  avg_generations_per_subscriber_30_days: number;
  distribution_30_days: {
    zero: number;
    one_to_five: number;
    six_to_twenty: number;
    twentyone_to_fifty: number;
    fifty_plus: number;
  };
};

// Agregação feita inteira no banco (RPC) — usage_events não tem índice
// eficiente pra "GROUP BY dia entre todos os usuários", não dá pra
// puxar linhas cruas pro navegador.
export async function getUsageStats(): Promise<UsageStats> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_usage_stats");
  if (error) throw error;
  return data as UsageStats;
}
