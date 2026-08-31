import "server-only";
import { getSupabaseServerClient } from "./server-client";

export type BibleNote = {
  verseId: string;
  note: string;
  updatedAt: string;
};

// Todas as anotações de um capítulo, num Map por verse_id — evita uma
// query por versículo ao carregar a página. Mesmo padrão de
// listHighlights().
export async function listNotes(
  userId: string,
  book: string,
  chapter: number,
): Promise<Map<string, string>> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_notes")
    .select("verse_id, note")
    .eq("user_id", userId)
    .like("verse_id", `${book}.${chapter}.%`);

  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.verse_id as string, row.note as string]));
}

// Todas as anotações de versículo do usuário, em qualquer livro/
// capítulo — pra listar junto com o Bloco de Anotações (ver
// /anotacoes/page.tsx). Sem filtro de capítulo, ao contrário de
// listNotes().
export async function listAllNotes(userId: string): Promise<BibleNote[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_notes")
    .select("verse_id, note, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    verseId: row.verse_id,
    note: row.note,
    updatedAt: row.updated_at,
  }));
}

// RLS (select_own_bible_notes) já garante isolamento por usuário.
export async function getNote(userId: string, verseId: string): Promise<BibleNote | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_notes")
    .select("verse_id, note, updated_at")
    .eq("user_id", userId)
    .eq("verse_id", verseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { verseId: data.verse_id, note: data.note, updatedAt: data.updated_at };
}

// Uma anotação por versículo — chamar de novo edita a existente
// (upsert por user_id+verse_id, único índice criado na migration).
export async function upsertNote(userId: string, verseId: string, note: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("bible_notes")
    .upsert({ user_id: userId, verse_id: verseId, note }, { onConflict: "user_id,verse_id" });

  if (error) throw error;
}

export async function deleteNote(userId: string, verseId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("bible_notes")
    .delete()
    .eq("user_id", userId)
    .eq("verse_id", verseId);

  if (error) throw error;
}
