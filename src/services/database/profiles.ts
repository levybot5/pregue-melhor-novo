import "server-only";
import { getSupabaseServerClient } from "./server-client";

export type Profile = {
  id: string;
  name: string | null;
};

// RLS (select_own_profile) já garante que só o próprio profile é
// legível — não é preciso filtrar por usuário aqui.
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}
