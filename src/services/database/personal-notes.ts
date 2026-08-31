import "server-only";
import { getSupabaseServerClient } from "./server-client";

export type PersonalNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}): PersonalNote {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Mais recente primeiro — mesmo índice personal_notes_user_updated_idx.
export async function listPersonalNotes(userId: string): Promise<PersonalNote[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("personal_notes")
    .select("id, title, content, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getPersonalNote(userId: string, id: string): Promise<PersonalNote | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("personal_notes")
    .select("id, title, content, created_at, updated_at")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

// "+ Nova anotação" cria a linha vazia na hora — a tela de edição que
// abre em seguida já cuida de preencher via autosave, sem formulário
// de criação separado.
export async function createPersonalNote(userId: string): Promise<PersonalNote> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("personal_notes")
    .insert({ user_id: userId, title: "", content: "" })
    .select("id, title, content, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updatePersonalNote(
  userId: string,
  id: string,
  fields: { title: string; content: string },
): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("personal_notes")
    .update({ title: fields.title, content: fields.content })
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw error;
}

export async function deletePersonalNote(userId: string, id: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("personal_notes").delete().eq("user_id", userId).eq("id", id);

  if (error) throw error;
}
