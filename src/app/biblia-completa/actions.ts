"use server";

import { generateVerseExplanation, type BibleVerseExplanation } from "@/services/ai";
import {
  getCachedVerseExplanation,
  cacheVerseExplanation,
  upsertNote,
  deleteNote,
  setHighlight,
  removeHighlight,
} from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import {
  reserveGenerationOrTrial,
  releaseReservation,
  recordReservationUsage,
  type GenerationBlockReason,
} from "@/services/billing";

export type ExplainVerseResult =
  | { status: "error"; message: string }
  | { status: "blocked"; reason: GenerationBlockReason; message: string }
  | { status: "explained"; explanation: BibleVerseExplanation; cached: boolean };

// Explicação de versículo é a mesma pra todo mundo — cache compartilhado
// em bible_verse_explanations. Cache hit é grátis (nem chega a checar
// trial/assinatura); cache miss usa a mesma cota de sempre.
export async function explainVerseAction(
  verseId: string,
  reference: string,
  text: string,
): Promise<ExplainVerseResult> {
  try {
    const cached = await getCachedVerseExplanation(verseId);
    if (cached) {
      return { status: "explained", explanation: cached, cached: true };
    }
  } catch (error) {
    console.error("Falha ao consultar cache de explicação de versículo:", error);
  }

  const guard = await reserveGenerationOrTrial("biblia_versiculo");
  if (!guard.allowed) {
    return { status: "blocked", reason: guard.reason, message: guard.message };
  }

  let result: Awaited<ReturnType<typeof generateVerseExplanation>>;
  try {
    result = await generateVerseExplanation({ reference, text });
  } finally {
    await releaseReservation(guard);
  }

  if (!result.success) {
    return { status: "error", message: result.message };
  }

  await recordReservationUsage(guard, "biblia_versiculo");

  try {
    await cacheVerseExplanation(verseId, result.data);
  } catch (error) {
    console.error("Falha ao salvar cache de explicação de versículo:", error);
  }

  return { status: "explained", explanation: result.data, cached: false };
}

export type NoteActionResult = { success: true } | { success: false; message: string };

export async function saveNoteAction(verseId: string, note: string): Promise<NoteActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Você precisa entrar para anotar." };
  }
  const trimmed = note.trim();
  if (!trimmed) {
    return { success: false, message: "A anotação não pode ficar vazia." };
  }
  try {
    await upsertNote(user.id, verseId, trimmed);
    return { success: true };
  } catch (error) {
    console.error("Falha ao salvar anotação:", error);
    return { success: false, message: "Não foi possível salvar agora. Tente novamente." };
  }
}

export async function deleteNoteAction(verseId: string): Promise<NoteActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Você precisa entrar para excluir." };
  }
  try {
    await deleteNote(user.id, verseId);
    return { success: true };
  } catch (error) {
    console.error("Falha ao excluir anotação:", error);
    return { success: false, message: "Não foi possível excluir agora. Tente novamente." };
  }
}

export type HighlightActionResult = { success: true } | { success: false; message: string };

export async function setHighlightAction(
  verseId: string,
  color: string,
): Promise<HighlightActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Você precisa entrar para grifar." };
  }
  try {
    await setHighlight(user.id, verseId, color);
    return { success: true };
  } catch (error) {
    console.error("Falha ao grifar versículo:", error);
    return { success: false, message: "Não foi possível grifar agora. Tente novamente." };
  }
}

export async function removeHighlightAction(verseId: string): Promise<HighlightActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Você precisa entrar para remover o grifo." };
  }
  try {
    await removeHighlight(user.id, verseId);
    return { success: true };
  } catch (error) {
    console.error("Falha ao remover grifo:", error);
    return { success: false, message: "Não foi possível remover agora. Tente novamente." };
  }
}
