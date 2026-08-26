"use server";

import {
  generateAulaBiblica,
  aulaBiblicaAmbientes,
  aulaBiblicaPublicos,
  aulaBiblicaDuracoes,
  aulaBiblicaProfundidades,
  aulaBiblicaBibleVersions,
  type AulaBiblicaContent,
  type AulaBiblicaInput,
} from "@/services/ai";
import { createContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import {
  reserveGenerationOrTrial,
  releaseReservation,
  recordReservationUsage,
  type GenerationBlockReason,
} from "@/services/billing";
import { TEMA_MIN_LENGTH, TEMA_MAX_LENGTH, OBJETIVO_MAX_LENGTH, NOTES_MAX_LENGTH } from "./constants";

export type AulaBiblicaActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "saved"; contentId: string; aula: AulaBiblicaContent }
  | { status: "generated_not_saved"; aula: AulaBiblicaContent; message: string }
  // Trial sem login: gerou com sucesso, mas não existe usuário para
  // salvar na Biblioteca (ver reserveGenerationOrTrial, mode "trial").
  | { status: "generated"; aula: AulaBiblicaContent };

function validateInput(input: AulaBiblicaInput): string | null {
  const tema = input.tema.trim();

  if (tema.length < TEMA_MIN_LENGTH) {
    return "Use um tema ou passagem com pelo menos 3 caracteres.";
  }
  if (tema.length > TEMA_MAX_LENGTH) {
    return "Use um tema ou passagem com até 500 caracteres.";
  }
  if (!(aulaBiblicaAmbientes as readonly string[]).includes(input.ambiente)) {
    return "Selecione onde você vai ensinar.";
  }
  if (!(aulaBiblicaPublicos as readonly string[]).includes(input.publico)) {
    return "Selecione um público.";
  }
  if (!(aulaBiblicaDuracoes as readonly string[]).includes(input.duracao)) {
    return "Selecione uma duração.";
  }
  if (!(aulaBiblicaProfundidades as readonly string[]).includes(input.profundidade)) {
    return "Selecione uma profundidade.";
  }
  if (!(aulaBiblicaBibleVersions as readonly string[]).includes(input.bibleVersion)) {
    return "Selecione uma versão da Bíblia válida.";
  }
  if (input.objetivo.trim().length > OBJETIVO_MAX_LENGTH) {
    return `Use um objetivo com até ${OBJETIVO_MAX_LENGTH} caracteres.`;
  }
  if (input.notes.trim().length > NOTES_MAX_LENGTH) {
    return `Use observações com até ${NOTES_MAX_LENGTH} caracteres.`;
  }
  return null;
}

async function persistAulaBiblica(aula: AulaBiblicaContent): Promise<AulaBiblicaActionResult> {
  try {
    const content = await createContent({
      type: "aula_biblica",
      title: aula.titulo,
      base_text: aula.texto_base,
      content: { ...aula },
    });
    return { status: "saved", contentId: content.id, aula };
  } catch (error) {
    console.error("Falha ao salvar aula bíblica:", error);
    return {
      status: "generated_not_saved",
      aula,
      message: "Aula gerada, mas não foi possível salvar na Biblioteca.",
    };
  }
}

// Mesma ordem/disciplina de /pregacao: validar input (grátis) ->
// reservar (auth + assinatura + limites + lock, só banco) -> chamar IA
// -> liberar lock -> só se a IA retornou uma resposta válida, registrar
// consumo -> autosave.
export async function generateAndSaveAulaBiblica(
  input: AulaBiblicaInput,
): Promise<AulaBiblicaActionResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { status: "error", message: validationError };
  }

  const guard = await reserveGenerationOrTrial("aula_biblica");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generateAulaBiblica>>;
  try {
    result = await generateAulaBiblica({
      ...input,
      tema: input.tema.trim(),
      objetivo: input.objetivo.trim(),
      notes: input.notes.trim(),
    });
  } finally {
    await releaseReservation(guard);
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordReservationUsage(guard, "aula_biblica");

  if (guard.mode === "trial") {
    return { status: "generated", aula: result.data };
  }

  return persistAulaBiblica(result.data);
}

// Salva um resultado já gerado, sem chamar a IA novamente — usado quando
// a geração funcionou mas o salvamento falhou na primeira tentativa.
export async function saveAulaBiblica(aula: AulaBiblicaContent): Promise<AulaBiblicaActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para salvar." };
  }

  return persistAulaBiblica(aula);
}
