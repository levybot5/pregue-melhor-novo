"use server";

import {
  generateSermon,
  sermonAudiences,
  sermonDurations,
  sermonStyles,
  type SermonContent,
  type SermonInput,
} from "@/services/ai";
import { createContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import {
  reserveGenerationOrTrial,
  releaseReservation,
  recordReservationUsage,
  type GenerationBlockReason,
} from "@/services/billing";
import { THEME_MAX_LENGTH, THEME_MIN_LENGTH } from "./constants";

export type SermonActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "saved"; contentId: string; sermon: SermonContent }
  | { status: "generated_not_saved"; sermon: SermonContent; message: string }
  // Trial sem login: gerou com sucesso, mas não existe usuário para
  // salvar na Biblioteca (ver reserveGenerationOrTrial, mode "trial").
  | { status: "generated"; sermon: SermonContent };

function validateInput(input: SermonInput): string | null {
  const theme = input.themeOrPassage.trim();

  if (theme.length < THEME_MIN_LENGTH) {
    return "Use um tema ou passagem com pelo menos 3 caracteres.";
  }
  if (theme.length > THEME_MAX_LENGTH) {
    return "Use um tema ou passagem com até 500 caracteres.";
  }
  if (!(sermonAudiences as readonly string[]).includes(input.audience)) {
    return "Selecione onde vai ministrar.";
  }
  if (!(sermonStyles as readonly string[]).includes(input.style)) {
    return "Selecione um estilo.";
  }
  if (!(sermonDurations as readonly string[]).includes(input.duration)) {
    return "Selecione uma duração.";
  }
  return null;
}

async function persistSermon(sermon: SermonContent): Promise<SermonActionResult> {
  try {
    const content = await createContent({
      type: "pregacao",
      title: sermon.titulo,
      base_text: sermon.texto_base,
      content: { ...sermon },
    });
    return { status: "saved", contentId: content.id, sermon };
  } catch (error) {
    console.error("Falha ao salvar pregação:", error);
    return {
      status: "generated_not_saved",
      sermon,
      message: "Pregação gerada, mas não foi possível salvar na Biblioteca.",
    };
  }
}

// 1 clique do usuário nesta action = no máximo 1 chamada a generateSermon.
// Sem retry automático: se a geração falhar, retorna erro e o usuário
// decide se tenta de novo manualmente.
//
// Ordem: validar input (grátis) -> reservar (auth + assinatura +
// limites + lock, só banco) -> chamar IA -> liberar lock -> só se a IA
// retornou uma resposta válida, registrar consumo -> autosave.
export async function generateAndSaveSermon(
  input: SermonInput,
): Promise<SermonActionResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { status: "error", message: validationError };
  }

  const guard = await reserveGenerationOrTrial("pregacao");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generateSermon>>;
  try {
    result = await generateSermon({
      ...input,
      themeOrPassage: input.themeOrPassage.trim(),
    });
  } finally {
    await releaseReservation(guard);
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordReservationUsage(guard, "pregacao");

  if (guard.mode === "trial") {
    return { status: "generated", sermon: result.sermon };
  }

  return persistSermon(result.sermon);
}

// Salva um resultado já gerado, sem chamar a IA novamente — usado quando
// a geração funcionou mas o salvamento falhou na primeira tentativa.
// Não passa pelo guard: o consumo já foi registrado, isso não gera IA.
export async function saveSermon(sermon: SermonContent): Promise<SermonActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para salvar." };
  }

  return persistSermon(sermon);
}
