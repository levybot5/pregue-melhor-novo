"use server";

import {
  expandOutline,
  ministryAudiences,
  ministryDurations,
  ministryStyles,
  type OutlineExpansionContent,
  type OutlineExpansionInput,
} from "@/services/ai";
import { createContent } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import { OUTLINE_MAX_LENGTH, OUTLINE_MIN_LENGTH } from "./constants";

export type OutlineExpansionActionResult =
  | { status: "error"; message: string }
  | { status: "saved"; contentId: string }
  | { status: "generated_not_saved"; content: OutlineExpansionContent; message: string };

function validateInput(input: OutlineExpansionInput): string | null {
  const outline = input.outline.trim();

  if (outline.length < OUTLINE_MIN_LENGTH) {
    return "Cole um esboço com pelo menos 5 caracteres.";
  }
  if (outline.length > OUTLINE_MAX_LENGTH) {
    return "Use um esboço com até 5.000 caracteres.";
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

async function persistExpansion(
  expansion: OutlineExpansionContent,
): Promise<OutlineExpansionActionResult> {
  try {
    const content = await createContent({
      type: "esboco_pregacao",
      title: expansion.titulo,
      base_text: expansion.texto_base,
      content: { ...expansion },
    });
    return { status: "saved", contentId: content.id };
  } catch (error) {
    console.error("Falha ao salvar pregação desenvolvida:", error);
    return {
      status: "generated_not_saved",
      content: expansion,
      message: "Pregação gerada, mas não foi possível salvar na Biblioteca.",
    };
  }
}

// 1 clique do usuário nesta action = no máximo 1 chamada a expandOutline.
export async function generateAndSaveExpansion(
  input: OutlineExpansionInput,
): Promise<OutlineExpansionActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para gerar." };
  }

  const validationError = validateInput(input);
  if (validationError) {
    return { status: "error", message: validationError };
  }

  const result = await expandOutline({ ...input, outline: input.outline.trim() });

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  return persistExpansion(result.data);
}

// Salva um resultado já gerado, sem chamar a IA novamente.
export async function saveExpansion(
  expansion: OutlineExpansionContent,
): Promise<OutlineExpansionActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para salvar." };
  }

  return persistExpansion(expansion);
}
