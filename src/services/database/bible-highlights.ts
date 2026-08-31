import "server-only";
import { getSupabaseServerClient } from "./server-client";

export type BibleHighlight = {
  verseId: string;
  color: string;
};

// Todos os grifos de um capítulo, num Map por verse_id — pensado pra
// ser consultado uma vez por carregamento da página (não por
// versículo), igual ao listFavoriteContentIds() de favorites.ts.
export async function listHighlights(
  userId: string,
  book: string,
  chapter: number,
): Promise<Map<string, string>> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_highlights")
    .select("verse_id, color")
    .eq("user_id", userId)
    .like("verse_id", `${book}.${chapter}.%`);

  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.verse_id as string, row.color as string]));
}

// Grifar de novo (cor diferente) só troca a cor — upsert por
// user_id+verse_id, único índice criado na migration.
export async function setHighlight(userId: string, verseId: string, color: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("bible_highlights")
    .upsert({ user_id: userId, verse_id: verseId, color }, { onConflict: "user_id,verse_id" });

  if (error) throw error;
}

export async function removeHighlight(userId: string, verseId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("bible_highlights")
    .delete()
    .eq("user_id", userId)
    .eq("verse_id", verseId);

  if (error) throw error;
}
