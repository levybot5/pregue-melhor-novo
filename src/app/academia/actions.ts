"use server";

import { getCurrentUser } from "@/services/auth";
import { isSubscriptionActive } from "@/services/billing/subscription";
import { setLessonCompletion } from "@/services/academy";
import {
  createEbookOnlyPurchase,
  getPurchaseStatus,
  InvalidPixPurchaseInputError,
  type EbookPurchaseInput,
} from "@/services/billing";

export type EbookPurchaseActionResult =
  | { success: true; purchaseId: string; qrCodeBase64: string; copyPaste: string }
  | { success: false; message: string };

// Compra avulsa do ebook de dentro da Academia — sempre logado (a
// própria página já exige sessão antes de renderizar essa seção), a
// compra já nasce vinculada à conta, sem precisar de claim depois.
export async function createEbookPurchaseAction(
  input: EbookPurchaseInput,
): Promise<EbookPurchaseActionResult> {
  try {
    const result = await createEbookOnlyPurchase(input);
    return { success: true, ...result };
  } catch (error) {
    if (error instanceof InvalidPixPurchaseInputError) {
      return { success: false, message: error.message };
    }
    console.error("Falha ao criar cobrança do ebook:", error);
    return {
      success: false,
      message: "Não foi possível gerar o PIX agora. Tente novamente em instantes.",
    };
  }
}

export async function getEbookPurchaseStatusAction(purchaseId: string) {
  return getPurchaseStatus(purchaseId);
}

export type ToggleLessonState = { completed: boolean; error: string | null };

// Único jeito de marcar/desmarcar uma aula como concluída, para
// qualquer curso da Academia — sempre um clique explícito do usuário
// (nunca automático, ver §9). Reverifica sessão e assinatura aqui,
// mesmo a página já checando antes: uma Server Action é um endpoint
// próprio, não herda a checagem da página.
export async function toggleLessonCompletionAction(
  courseId: string,
  moduleId: number,
  lessonId: number,
  completed: boolean,
): Promise<ToggleLessonState> {
  const user = await getCurrentUser();
  if (!user) {
    return { completed: !completed, error: "Você precisa entrar para salvar seu progresso." };
  }

  const hasProAccess = await isSubscriptionActive(user.id);
  if (!hasProAccess) {
    return {
      completed: !completed,
      error: "Assine o Pregue Melhor Pro para acompanhar seu progresso.",
    };
  }

  await setLessonCompletion(user.id, courseId, moduleId, lessonId, completed);
  return { completed, error: null };
}
