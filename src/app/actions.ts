"use server";

import { redirect } from "next/navigation";
import { signOut, getCurrentUser } from "@/services/auth";
import { addFavorite, removeFavorite, type FavoriteContentType } from "@/services/database";

export async function signOutAction() {
  await signOut();
  redirect("/");
}

export type ToggleFavoriteResult = { favorited: boolean } | { error: string };

// Compartilhada por Pregações Prontas e Esboços Prontos — não há IA
// nem consumo de geração envolvidos, só grava/apaga a relação de
// favorito do usuário atual.
export async function toggleFavoriteAction(
  contentType: FavoriteContentType,
  contentId: string,
  currentlyFavorited: boolean,
): Promise<ToggleFavoriteResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Você precisa entrar para favoritar." };
  }

  try {
    if (currentlyFavorited) {
      await removeFavorite(contentType, contentId);
    } else {
      await addFavorite(contentType, contentId);
    }
    return { favorited: !currentlyFavorited };
  } catch (error) {
    console.error("Falha ao favoritar:", error);
    return { error: "Não foi possível atualizar o favorito agora." };
  }
}
