"use server";

import {
  generatePulpitOutline,
  ministryAudiences,
  ministryDurations,
  ministryStyles,
  type PulpitOutlineContent,
  type PulpitOutlineInput,
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

export type PulpitOutlineActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "saved"; contentId: string }
  | { status: "generated_not_saved"; outline: PulpitOutlineContent; message: string };

function validateInput(input: PulpitOutlineInput): string | null {
  const theme = input.themeOrPassage.trim();

  if (theme.length < THEME_MIN_LENGTH) {
    return "Use um tema ou passagem com pelo menos 3 caracteres.";
  }
  if (theme.length > THEME_MAX_LENGTH) {
    return "Use um tema ou passagem com até 500 caracteres.";
  }
  if (!(ministryAudiences as readonly string[]).includes(input.audience)) {
    return "Selecione onde vai ministrar.";
  }
  if (!(ministryStyles as readonly string[]).includes(input.style)) {
    return "Selecione um estilo.";
  }
  if (!(ministryDurations as readonly string[]).includes(input.duration)) {
    return "Selecione uma duração.";
  }
  return null;
}

async function persistOutline(
  outline: PulpitOutlineContent,
): Promise<PulpitOutlineActionResult> {
  try {
    const content = await createContent({
      type: "esboco_pulpito",
      title: outline.tema,
      base_text: outline.texto_base,
      content: { ...outline },
    });
    return { status: "saved", contentId: content.id };
  } catch (error) {
    console.error("Falha ao salvar esboço para o púlpito:", error);
    return {
      status: "generated_not_saved",
      outline,
      message: "Esboço gerado, mas não foi possível salvar na Biblioteca.",
    };
  }
}

// 1 clique do usuário nesta action = no máximo 1 chamada a generatePulpitOutline.
export async function generateAndSavePulpitOutline(
  input: PulpitOutlineInput,
): Promise<PulpitOutlineActionResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { status: "error", message: validationError };
  }

  const guard = await reserveGeneration("esboco_pulpito");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generatePulpitOutline>>;
  try {
    result = await generatePulpitOutline({
      ...input,
      themeOrPassage: input.themeOrPassage.trim(),
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
export async function savePulpitOutline(
  outline: PulpitOutlineContent,
): Promise<PulpitOutlineActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para salvar." };
  }

  return persistOutline(outline);
}
