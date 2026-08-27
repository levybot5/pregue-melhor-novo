"use server";

import { revalidatePath } from "next/cache";
import { deleteOwnAccount, getCurrentUser, type AuthActionResult } from "@/services/auth";
import { updateProfileName } from "@/services/database";

export async function deleteAccountAction(): Promise<AuthActionResult> {
  return deleteOwnAccount();
}

const NAME_MAX_LENGTH = 60;

export type UpdateNameResult =
  | { status: "saved"; name: string | null }
  | { status: "error"; message: string };

export async function updateNameAction(name: string): Promise<UpdateNameResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Sessão expirada. Entre novamente." };
  }

  const trimmed = name.trim();
  if (trimmed.length > NAME_MAX_LENGTH) {
    return { status: "error", message: `O nome pode ter no máximo ${NAME_MAX_LENGTH} caracteres.` };
  }

  try {
    await updateProfileName(user.id, trimmed);
  } catch (error) {
    console.error("Falha ao salvar nome do perfil:", error);
    return { status: "error", message: "Não foi possível salvar o nome agora. Tente de novo." };
  }

  // O nome aparece no cabeçalho da Home (saudação) — invalida o cache
  // de navegação pra refletir sem precisar de um reload manual.
  revalidatePath("/");
  revalidatePath("/conta");

  return { status: "saved", name: trimmed || null };
}
