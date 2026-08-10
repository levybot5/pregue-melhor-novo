"use server";

import { generateBibleStudy, type BibleStudyContent } from "@/services/ai";
import { createContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import {
  reserveGeneration,
  releaseGenerationLock,
  recordUsage,
  type GenerationBlockReason,
} from "@/services/billing";
import { PASSAGE_MAX_LENGTH, PASSAGE_MIN_LENGTH } from "./constants";

export type BibleStudyActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "saved"; contentId: string }
  | { status: "generated_not_saved"; study: BibleStudyContent; message: string };

async function persistStudy(study: BibleStudyContent): Promise<BibleStudyActionResult> {
  try {
    const content = await createContent({
      type: "biblia_explicada",
      title: study.titulo,
      base_text: study.passagem,
      content: { ...study },
    });
    return { status: "saved", contentId: content.id };
  } catch (error) {
    console.error("Falha ao salvar estudo bíblico:", error);
    return {
      status: "generated_not_saved",
      study,
      message: "Estudo gerado, mas não foi possível salvar na Biblioteca.",
    };
  }
}

// 1 clique do usuário nesta action = no máximo 1 chamada a generateBibleStudy.
// Sem retry automático.
export async function generateAndSaveBibleStudy(
  passage: string,
): Promise<BibleStudyActionResult> {
  const trimmed = passage.trim();
  if (trimmed.length < PASSAGE_MIN_LENGTH) {
    return { status: "error", message: "Use uma passagem com pelo menos 3 caracteres." };
  }
  if (trimmed.length > PASSAGE_MAX_LENGTH) {
    return { status: "error", message: "Use uma passagem com até 500 caracteres." };
  }

  const guard = await reserveGeneration("biblia_explicada");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generateBibleStudy>>;
  try {
    result = await generateBibleStudy({ passage: trimmed });
  } finally {
    await releaseGenerationLock();
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordUsage(guard.userId, "biblia_explicada");

  return persistStudy(result.data);
}

// Salva um resultado já gerado, sem chamar a IA novamente.
export async function saveBibleStudy(
  study: BibleStudyContent,
): Promise<BibleStudyActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para salvar." };
  }

  return persistStudy(study);
}
