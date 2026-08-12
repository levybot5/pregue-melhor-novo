import "server-only";
import { getSupabaseServerClient } from "./server-client";

// Acervo editorial (Pregações Prontas / Esboços Prontos): conteúdo
// fixo, escrito por nós, nunca gerado por IA. RLS (select_ready_*)
// libera leitura para qualquer usuário autenticado — não filtra por
// dono, porque não tem dono.

export type Testament = "AT" | "NT" | null;

export type ContentCategory = {
  id: string;
  label: string;
  sort_order: number;
};

export type ReadySermonPoint = {
  title: string;
  text: string;
  items?: string[];
};

export type ReadySermon = {
  id: string;
  slug: string;
  title: string;
  base_text: string;
  category_id: string;
  testament: Testament;
  short_description: string;
  introduction: string;
  points: ReadySermonPoint[];
  application: string;
  conclusion: string;
  appeal: string | null;
  prayer: string | null;
};

// Forma leve para listagem — sem "points"/"introduction"/etc., que só
// importam ao abrir o detalhe (item 17 da etapa: não carregar o
// conteúdo completo na lista).
export type ReadySermonSummary = Pick<
  ReadySermon,
  "id" | "slug" | "title" | "base_text" | "category_id" | "testament" | "short_description"
>;

const SERMON_SUMMARY_COLUMNS =
  "id, slug, title, base_text, category_id, testament, short_description";

export type ReadyOutlinePoint = {
  title: string;
  bullets: string[];
};

export type ReadyOutline = {
  id: string;
  slug: string;
  title: string;
  base_text: string;
  category_id: string;
  testament: Testament;
  short_description: string;
  central_idea: string;
  short_introduction: string;
  points: ReadyOutlinePoint[];
  applications: string[];
  conclusion_appeal: string | null;
};

export type ReadyOutlineSummary = Pick<
  ReadyOutline,
  "id" | "slug" | "title" | "base_text" | "category_id" | "testament" | "short_description"
>;

const OUTLINE_SUMMARY_COLUMNS =
  "id, slug, title, base_text, category_id, testament, short_description";

export async function listCategories(): Promise<ContentCategory[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_categories")
    .select("id, label, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ContentCategory[];
}

export async function listReadySermons(): Promise<ReadySermonSummary[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ready_sermons")
    .select(SERMON_SUMMARY_COLUMNS)
    .order("title", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ReadySermonSummary[];
}

export async function getReadySermonBySlug(slug: string): Promise<ReadySermon | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ready_sermons")
    .select(
      "id, slug, title, base_text, category_id, testament, short_description, introduction, points, application, conclusion, appeal, prayer",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data as ReadySermon | null;
}

export async function listReadyOutlines(): Promise<ReadyOutlineSummary[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ready_outlines")
    .select(OUTLINE_SUMMARY_COLUMNS)
    .order("title", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ReadyOutlineSummary[];
}

export async function getReadyOutlineBySlug(slug: string): Promise<ReadyOutline | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ready_outlines")
    .select(
      "id, slug, title, base_text, category_id, testament, short_description, central_idea, short_introduction, points, applications, conclusion_appeal",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data as ReadyOutline | null;
}
