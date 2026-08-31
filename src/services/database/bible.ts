import "server-only";
import { getSupabaseServerClient } from "./server-client";
import type { BibleVerseExplanation } from "@/services/ai";

export type BibleVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BibleContinueReading = {
  book: string;
  chapter: number;
  lastReadAt: string;
};

// ACF (Almeida Corrigida Fiel) — mesma tradução carregada por
// scripts/import-bible.mjs. Trocar aqui exige rodar o script de novo
// com a nova versão (a coluna `version` permite mais de uma no futuro).
const BIBLE_VERSION = "acf";

// Texto já importado pra bible_verses (script scripts/import-bible.mjs)
// — nenhuma chamada externa acontece aqui, só leitura do banco.
export async function getChapterVerses(book: string, chapter: number): Promise<BibleVerse[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_verses")
    .select("book, chapter, verse, text")
    .eq("book", book)
    .eq("chapter", chapter)
    .eq("version", BIBLE_VERSION)
    .order("verse", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BibleVerse[];
}

// RLS (select_own_bible_reading_progress) já garante isolamento por
// usuário — não é preciso filtrar aqui.
export async function recordChapterRead(
  userId: string,
  book: string,
  chapter: number,
): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("bible_reading_progress")
    .upsert(
      { user_id: userId, book, chapter, last_read_at: new Date().toISOString() },
      { onConflict: "user_id,book,chapter" },
    );

  if (error) throw error;
}

// Mesmo offset fixo (-3h, sem horário de verão desde 2019) usado em
// reading-plan-data.ts — copiado localmente de propósito, mesma razão
// de lá (não criar acoplamento por uma função tão pequena).
const BRAZIL_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

function toBrazilDateKey(iso: string): string {
  const brazilLocal = new Date(new Date(iso).getTime() - BRAZIL_UTC_OFFSET_MS);
  return `${brazilLocal.getUTCFullYear()}-${brazilLocal.getUTCMonth()}-${brazilLocal.getUTCDate()}`;
}

// Dias seguidos com pelo menos um capítulo lido — pra Home/Leitura de
// hoje (ver TodayReadingCard). Deriva de bible_reading_progress: cada
// linha só guarda o último last_read_at daquele capítulo (não um
// histórico completo), mas isso basta pra saber "teve leitura nesse
// dia" — não importa qual capítulo, só que algum foi tocado. Se ainda
// não leu nada hoje, conta a partir de ontem (não zera o streak só por
// ainda não ter lido hoje).
export async function getReadingStreak(userId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_reading_progress")
    .select("last_read_at")
    .eq("user_id", userId);

  if (error) throw error;

  const daysWithReading = new Set((data ?? []).map((row) => toBrazilDateKey(row.last_read_at)));

  const cursor = new Date();
  if (!daysWithReading.has(toBrazilDateKey(cursor.toISOString()))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (daysWithReading.has(toBrazilDateKey(cursor.toISOString()))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

// "Continuar de onde parou" — mesma ideia do getContinueLesson() da
// Academia: pega a linha mais recente por last_read_at.
export async function getContinueReading(userId: string): Promise<BibleContinueReading | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_reading_progress")
    .select("book, chapter, last_read_at")
    .eq("user_id", userId)
    .order("last_read_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { book: data.book, chapter: data.chapter, lastReadAt: data.last_read_at };
}

const EXPLANATION_VERSION = "acf";

// Explicação de versículo é a mesma pra todo mundo — cache compartilhado
// (não filtrado por usuário), pra nunca chamar a IA duas vezes pro
// mesmo versículo. Ver bible_verse_explanations na migration.
export async function getCachedVerseExplanation(
  verseId: string,
): Promise<BibleVerseExplanation | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bible_verse_explanations")
    .select("explanation")
    .eq("verse_id", verseId)
    .eq("version", EXPLANATION_VERSION)
    .maybeSingle();

  if (error) throw error;
  return (data?.explanation as BibleVerseExplanation | undefined) ?? null;
}

// Idempotente por natureza (unique em verse_id+version) — se dois
// usuários caírem em cache miss ao mesmo tempo pro mesmo versículo,
// o segundo insert só falha silenciosamente (23505), sem duplicar.
export async function cacheVerseExplanation(
  verseId: string,
  explanation: BibleVerseExplanation,
): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("bible_verse_explanations")
    .insert({ verse_id: verseId, version: EXPLANATION_VERSION, explanation });

  if (error && error.code !== "23505") throw error;
}
