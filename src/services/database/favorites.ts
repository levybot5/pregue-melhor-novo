import "server-only";
import { getSupabaseServerClient } from "./server-client";
import { getCurrentUser } from "@/services/auth";

export type FavoriteContentType = "pregacao_pronta" | "esboco_pronto";

// Só a relação (user_id + content_type + content_id) é salva — nunca
// uma cópia do conteúdo. RLS (select/insert/delete_own_favorites) já
// isola por dono; não precisa filtrar por usuário na leitura.
export async function listFavoriteContentIds(
  contentType: FavoriteContentType,
): Promise<Set<string>> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("content_id")
    .eq("content_type", contentType);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.content_id as string));
}

// Idempotente: favoritar algo já favoritado não é erro (23505 =
// unique_violation na constraint user_id/content_type/content_id).
export async function addFavorite(
  contentType: FavoriteContentType,
  contentId: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, content_type: contentType, content_id: contentId });

  if (error && error.code !== "23505") throw error;
}

export async function removeFavorite(
  contentType: FavoriteContentType,
  contentId: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("content_type", contentType)
    .eq("content_id", contentId);

  if (error) throw error;
}
