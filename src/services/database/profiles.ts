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

// RLS (update_own_profile) já garante que só o próprio profile pode ser
// atualizado — não é preciso filtrar por usuário aqui. `name` vazio
// limpa o campo (volta a usar o e-mail como saudação).
export async function updateProfileName(userId: string, name: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name: name.trim() || null })
    .eq("id", userId);

  if (error) throw error;
}
