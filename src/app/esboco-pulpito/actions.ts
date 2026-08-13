"use server";

import {
  condenseSermonOutline,
  sermonOutlineSummaryLevels,
  type SermonOutlineContent,
  type SermonOutlineInput,
} from "@/services/ai";
import { createContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import {
  reserveGeneration,
  releaseGenerationLock,
  recordUsage,
  type GenerationBlockReason,
} from "@/services/billing";
import { SERMON_MAX_LENGTH, SERMON_MIN_LENGTH } from "./constants";

export type SermonOutlineActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "saved"; contentId: string }
  | { status: "generated_not_saved"; outline: SermonOutlineContent; message: string };

function validateInput(input: SermonOutlineInput): string | null {
  const text = input.sermonText.trim();

  if (text.length < SERMON_MIN_LENGTH) {
    return `Cole uma pregação com pelo menos ${SERMON_MIN_LENGTH} caracteres.`;
  }
  if (text.length > SERMON_MAX_LENGTH) {
    return `Sua pregação tem ${text.length.toLocaleString("pt-BR")} caracteres — o máximo aceito é ${SERMON_MAX_LENGTH.toLocaleString("pt-BR")}. Reduza o texto antes de continuar.`;
  }
  if (!(sermonOutlineSummaryLevels as readonly string[]).includes(input.level)) {
    return "Selecione um nível de resumo.";
  }
  return null;
}

async function persistOutline(
  outline: SermonOutlineContent,
): Promise<SermonOutlineActionResult> {
  try {
    const content = await createContent({
      type: "esboco_pulpito",
      title: outline.titulo,
      base_text: outline.texto_base,
      content: { ...outline },
    });
    return { status: "saved", contentId: content.id };
  } catch (error) {
    console.error("Falha ao salvar Pregação para Esboço:", error);
    return {
      status: "generated_not_saved",
      outline,
      message: "Esboço gerado, mas não foi possível salvar na Biblioteca.",
    };
  }
}

// 1 clique do usuário nesta action = no máximo 1 chamada a condenseSermonOutline.
export async function generateAndSaveSermonOutline(
  input: SermonOutlineInput,
): Promise<SermonOutlineActionResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { status: "error", message: validationError };
  }

  const guard = await reserveGeneration("esboco_pulpito");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof condenseSermonOutline>>;
  try {
    result = await condenseSermonOutline({
      sermonText: input.sermonText.trim(),
      level: input.level,
    });
  } finally {
    await releaseGenerationLock();
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordUsage(guard.userId, "esboco_pulpito");

  return persistOutline(result.data);
}

// Salva um resultado já gerado, sem chamar a IA novamente.
export async function saveSermonOutline(
  outline: SermonOutlineContent,
): Promise<SermonOutlineActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para salvar." };
  }

  return persistOutline(outline);
}
