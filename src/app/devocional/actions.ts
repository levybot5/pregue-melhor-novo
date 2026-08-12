"use server";

import {
  generateDevotional,
  devotionalMoments,
  type DevotionalContent,
  type DevotionalInput,
} from "@/services/ai";
import { createContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import {
  reserveGeneration,
  releaseGenerationLock,
  recordUsage,
  type GenerationBlockReason,
} from "@/services/billing";
import { THEME_MAX_LENGTH, THEME_MIN_LENGTH } from "./constants";

export type DevotionalActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "saved"; contentId: string }
  | { status: "generated_not_saved"; devotional: DevotionalContent; message: string };

function validateInput(input: DevotionalInput): string | null {
  const theme = input.themeOrPassage.trim();

  if (theme.length < THEME_MIN_LENGTH) {
    return "Use um tema ou passagem com pelo menos 3 caracteres.";
  }
  if (theme.length > THEME_MAX_LENGTH) {
    return "Use um tema ou passagem com até 500 caracteres.";
  }
  if (!(devotionalMoments as readonly string[]).includes(input.moment)) {
    return "Selecione um momento.";
  }
  return null;
}

async function persistDevotional(
  devotional: DevotionalContent,
): Promise<DevotionalActionResult> {
  try {
    const content = await createContent({
      type: "devocional",
      title: devotional.titulo,
      base_text: devotional.texto_base,
      content: { ...devotional },
    });
    return { status: "saved", contentId: content.id };
  } catch (error) {
    console.error("Falha ao salvar devocional:", error);
    return {
      status: "generated_not_saved",
      devotional,
      message: "Devocional gerado, mas não foi possível salvar na Biblioteca.",
    };
  }
}

// 1 clique do usuário nesta action = no máximo 1 chamada a
// generateDevotional. Sem retry automático.
export async function generateAndSaveDevotional(
  input: DevotionalInput,
): Promise<DevotionalActionResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { status: "error", message: validationError };
  }

  const guard = await reserveGeneration("devocional");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generateDevotional>>;
  try {
    result = await generateDevotional({
      ...input,
      themeOrPassage: input.themeOrPassage.trim(),
    });
  } finally {
    await releaseGenerationLock();
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordUsage(guard.userId, "devocional");

  return persistDevotional(result.data);
}

// Salva um resultado já gerado, sem chamar a IA novamente.
export async function saveDevotional(
  devotional: DevotionalContent,
): Promise<DevotionalActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para salvar." };
  }

  return persistDevotional(devotional);
}
