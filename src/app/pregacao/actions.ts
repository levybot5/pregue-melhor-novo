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

export type SermonActionResult =
  | { status: "error"; message: string }
  | { status: "saved"; contentId: string }
  | { status: "generated_not_saved"; sermon: SermonContent; message: string };

function isSermonInput(input: SermonInput): input is SermonInput {
  return (
    typeof input.themeOrPassage === "string" &&
    input.themeOrPassage.trim().length > 0 &&
    (sermonAudiences as readonly string[]).includes(input.audience) &&
    (sermonStyles as readonly string[]).includes(input.style) &&
    (sermonDurations as readonly string[]).includes(input.duration)
  );
}

async function persistSermon(sermon: SermonContent): Promise<SermonActionResult> {
  try {
    const content = await createContent({
      type: "pregacao",
      title: sermon.titulo,
      base_text: sermon.texto_base,
      content: { ...sermon },
    });
    return { status: "saved", contentId: content.id };
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
export async function generateAndSaveSermon(
  input: SermonInput,
): Promise<SermonActionResult> {
  if (!isSermonInput(input)) {
    return { status: "error", message: "Preencha o tema ou passagem para gerar." };
  }

  const result = await generateSermon(input);

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  return persistSermon(result.sermon);
}

// Salva um resultado já gerado, sem chamar a IA novamente — usado quando
// a geração funcionou mas o salvamento falhou na primeira tentativa.
export async function saveSermon(sermon: SermonContent): Promise<SermonActionResult> {
  return persistSermon(sermon);
}
