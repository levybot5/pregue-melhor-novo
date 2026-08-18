"use server";

import { generateBibleStudy, bibleVersions, type BibleStudyContent, type BibleStudyInput } from "@/services/ai";
import { createContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import {
  reserveGenerationOrTrial,
  releaseReservation,
  recordReservationUsage,
  type GenerationBlockReason,
} from "@/services/billing";
import { PASSAGE_MAX_LENGTH, PASSAGE_MIN_LENGTH } from "./constants";

export type BibleStudyActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "saved"; contentId: string; study: BibleStudyContent }
  | { status: "generated_not_saved"; study: BibleStudyContent; message: string }
  | { status: "generated"; study: BibleStudyContent };

async function persistStudy(study: BibleStudyContent): Promise<BibleStudyActionResult> {
  try {
    const content = await createContent({
      type: "biblia_explicada",
      title: study.titulo,
      base_text: study.passagem,
      content: { ...study },
    });
    return { status: "saved", contentId: content.id, study };
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
  bibleVersion: BibleStudyInput["bibleVersion"] = "padrao",
): Promise<BibleStudyActionResult> {
  const trimmed = passage.trim();
  if (trimmed.length < PASSAGE_MIN_LENGTH) {
    return { status: "error", message: "Use uma passagem com pelo menos 3 caracteres." };
  }
  if (trimmed.length > PASSAGE_MAX_LENGTH) {
    return { status: "error", message: "Use uma passagem com até 500 caracteres." };
  }
  if (!(bibleVersions as readonly string[]).includes(bibleVersion)) {
    return { status: "error", message: "Selecione uma versão da Bíblia válida." };
  }

  const guard = await reserveGenerationOrTrial("biblia_explicada");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generateBibleStudy>>;
  try {
    result = await generateBibleStudy({ passage: trimmed, bibleVersion });
  } finally {
    await releaseReservation(guard);
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordReservationUsage(guard, "biblia_explicada");

  if (guard.mode === "trial") {
    return { status: "generated", study: result.data };
  }

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
