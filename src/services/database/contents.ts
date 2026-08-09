import { getSupabaseClient } from "./client";

export type Content = {
  id: string;
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

export async function createContent(input: NewContent): Promise<Content> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("contents")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Content;
}

export async function listContents(): Promise<Content[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("contents")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Content[];
}

export async function getContentById(id: string): Promise<Content | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("contents")
    .select()
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Content | null;
}
