"use server";

import { deleteContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";

export type DeleteContentResult = { success: true } | { success: false; message: string };

// RLS (delete_own_contents, auth.uid() = user_id) é quem de fato
// impede excluir conteúdo de outro usuário — a checagem de sessão aqui
// é só pra devolver uma mensagem clara em vez de deixar a query falhar
// silenciosamente.
export async function deleteContentAction(contentId: string): Promise<DeleteContentResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Você precisa entrar para excluir." };
  }

  try {
    await deleteContent(contentId);
    return { success: true };
  } catch (error) {
    console.error("Falha ao excluir conteúdo:", error);
    return { success: false, message: "Não foi possível excluir agora. Tente novamente." };
  }
}
