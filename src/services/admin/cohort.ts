import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type CohortRow = {
  cohort_month: string;
  cohort_size: number;
  retained_30_pct: number | null;
  retained_60_pct: number | null;
  retained_90_pct: number | null;
};

// Vem 100% de subscription_events (nasce vazia neste deploy) — sem
// coorte nenhuma até existir histórico pós-deploy, de propósito (nunca
// inventa coorte a partir de subscriptions.created_at).
export async function getCohortRetention(): Promise<CohortRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_cohort_retention");
  if (error) throw error;
  return (data as CohortRow[] | null) ?? [];
}
