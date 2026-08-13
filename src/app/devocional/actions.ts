"use server";

import {
  generateDevotional,
  devotionalMoments,
  type DevotionalContent,
  type DevotionalInput,
} from "@/services/ai";
import {
  reserveGeneration,
  releaseGenerationLock,
  recordUsage,
  type GenerationBlockReason,
} from "@/services/billing";

export type DevotionalActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "generated"; devotional: DevotionalContent };

function validateInput(input: DevotionalInput): string | null {
  if (!(devotionalMoments as readonly string[]).includes(input.moment)) {
    return "Selecione um momento.";
  }
  return null;
}

// Devocional NÃO é salvo na Biblioteca — o resultado vive só na tela,
// enquanto durar a sessão do usuário. 1 clique = no máximo 1 chamada
// a generateDevotional; consome 1 geração só se a IA retornar uma
// resposta válida.
export async function generateDevotionalAction(
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
    result = await generateDevotional(input);
  } finally {
    await releaseGenerationLock();
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordUsage(guard.userId, "devocional");

  return { status: "generated", devotional: result.data };
}
