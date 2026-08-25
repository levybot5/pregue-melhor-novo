import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type MonthlyNet = {
  month: string;
  gained: number;
  lost: number;
  has_data: boolean;
};

export type Trends = {
  monthly_net: MonthlyNet[];
  note: string;
};

// Só ganhos/perdas por mês a partir de subscription_events — nunca
// inventa um valor absoluto histórico (MRR/assinantes-ativos) de antes
// deste deploy, porque isso não é reconstruível.
export async function getTrends(): Promise<Trends> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_trends");
  if (error) throw error;
  return data as Trends;
}
