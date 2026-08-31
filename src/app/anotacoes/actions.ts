"use server";

import { getCurrentUser } from "@/services/auth";
import { createPersonalNote, updatePersonalNote, deletePersonalNote } from "@/services/database";
import { TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH } from "./constants";

type ActionResult = { success: true } | { success: false; message: string };
type CreateNoteResult = { success: true; id: string } | { success: false; message: string };

// getCurrentUser() aqui é só pra mensagem amigável — RLS
// (auth.uid() = user_id) já garante o isolamento de verdade, mesmo
// padrão de biblioteca/actions.ts e biblia-completa/actions.ts.
export async function createNoteAction(): Promise<CreateNoteResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Você precisa entrar para criar uma anotação." };

  try {
    const note = await createPersonalNote(user.id);
    return { success: true, id: note.id };
  } catch (error) {
    console.error("Falha ao criar anotação:", error);
    return { success: false, message: "Não foi possível criar a anotação agora. Tente novamente." };
  }
}

// Chamada pelo autosave — título/conteúdo já cortados no client antes
// de chegar aqui, mas corta de novo aqui por segurança (nunca confiar
// só em validação de client).
export async function updateNoteAction(
  id: string,
  title: string,
  content: string,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Você precisa entrar para salvar." };

  try {
    await updatePersonalNote(user.id, id, {
      title: title.slice(0, TITLE_MAX_LENGTH),
      content: content.slice(0, CONTENT_MAX_LENGTH),
    });
    return { success: true };
  } catch (error) {
    console.error("Falha ao salvar anotação:", error);
    return { success: false, message: "Não foi possível salvar agora." };
  }
}

export async function deleteNoteAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Você precisa entrar para excluir." };

  try {
    await deletePersonalNote(user.id, id);
    return { success: true };
  } catch (error) {
    console.error("Falha ao excluir anotação:", error);
    return { success: false, message: "Não foi possível excluir agora. Tente novamente." };
  }
}
