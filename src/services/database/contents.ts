import "server-only";
import { getSupabaseServerClient } from "./server-client";
import { getCurrentUser } from "@/services/auth";

export type Content = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  base_text: string | null;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type NewContent = {
  type: string;
  title: string;
  base_text?: string | null;
  content: Record<string, unknown>;
};

// user_id nunca vem do chamador: é sempre derivado da sessão no
// servidor. O RLS (auth.uid() = user_id) também impede qualquer outro
// valor de ser aceito, mas falhar aqui dá um erro mais claro.
export async function createContent(input: NewContent): Promise<Content> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contents")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Content;
}

// Não filtra por usuário explicitamente: o RLS já garante que só as
// linhas do usuário autenticado (auth.uid() = user_id) são retornadas.
export async function listContents(): Promise<Content[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contents")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Content[];
}

// Mesma lógica: se o conteúdo pertencer a outro usuário, o RLS faz a
// query retornar 0 linhas — vira null aqui, e a página trata como
// "não encontrado", sem vazar se o registro existe.
export async function getContentById(id: string): Promise<Content | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contents")
    .select()
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Content | null;
}
