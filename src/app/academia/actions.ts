"use server";

import { getCurrentUser } from "@/services/auth";
import { isSubscriptionActive } from "@/services/billing/subscription";
import { setLessonCompletion } from "@/services/academy";

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
