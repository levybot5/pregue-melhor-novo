"use server";

import {
  generateBibleDictionaryEntry,
  type BibleDictionaryEntry,
} from "@/services/ai";
import {
  reserveGenerationOrTrial,
  releaseReservation,
  recordReservationUsage,
  type GenerationBlockReason,
} from "@/services/billing";
import { QUERY_MAX_LENGTH, QUERY_MIN_LENGTH } from "./constants";

export type DictionaryActionResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "generated"; entry: BibleDictionaryEntry };

// 1 clique do usuário nesta action = no máximo 1 chamada a
// generateBibleDictionaryEntry. Sem retry automático. O Dicionário não
// salva na Biblioteca (é consulta rápida, não material de estudo pra
// guardar) — só consome 1 geração quando a IA retorna uma resposta
// válida, igual às outras ferramentas.
export async function searchBibleDictionaryAction(
  query: string,
): Promise<DictionaryActionResult> {
  const trimmed = query.trim();
  if (trimmed.length < QUERY_MIN_LENGTH) {
    return { status: "error", message: "Digite pelo menos 2 caracteres." };
  }
  if (trimmed.length > QUERY_MAX_LENGTH) {
    return { status: "error", message: "Use até 100 caracteres." };
  }

  const guard = await reserveGenerationOrTrial("dicionario_biblico");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generateBibleDictionaryEntry>>;
  try {
    result = await generateBibleDictionaryEntry({ query: trimmed });
  } finally {
    await releaseReservation(guard);
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordReservationUsage(guard, "dicionario_biblico");

  return { status: "generated", entry: result.data };
}
