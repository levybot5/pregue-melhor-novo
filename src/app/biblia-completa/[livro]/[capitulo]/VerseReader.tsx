"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { BibleVerse } from "@/services/database";
import type { BibleVerseExplanation } from "@/services/ai";
import { makeVerseId } from "@/lib/bible/books-data";
import { TrialSubscribeButton } from "@/components/TrialSubscribeButton";
import { PencilIcon, SparkleIcon, SpinnerIcon, ChevronLeftIcon } from "@/components/icons";
import { NOTES_MAX_LENGTH } from "../../../pregacao/constants";
import {
  explainVerseAction,
  saveNoteAction,
  deleteNoteAction,
  setHighlightAction,
  removeHighlightAction,
} from "../../actions";

// Anotação da Bíblia Guiada não tem limite de tamanho; "Observações
// adicionais" do Criar Pregação tem (NOTES_MAX_LENGTH) — corta com
// reticências ao montar o link em vez de mexer no limite do formulário.
function truncateForSermon(text: string): string {
  if (text.length <= NOTES_MAX_LENGTH) return text;
  return `${text.slice(0, NOTES_MAX_LENGTH - 1)}…`;
}

type VerseReaderProps = {
  book: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
  initialHighlights: Record<string, string>;
  initialNotes: Record<string, string>;
  previousHref: string | null;
  nextHref: string | null;
};

const HIGHLIGHT_COLORS: { value: string; className: string; label: string }[] = [
  { value: "amber", className: "bg-amber-200", label: "Amarelo" },
  { value: "sky", className: "bg-sky-200", label: "Azul" },
  { value: "rose", className: "bg-rose-200", label: "Rosa" },
  { value: "emerald", className: "bg-emerald-200", label: "Verde" },
];

const HIGHLIGHT_BG: Record<string, string> = {
  amber: "bg-amber-100",
  sky: "bg-sky-100",
  rose: "bg-rose-100",
  emerald: "bg-emerald-100",
};

export function VerseReader({
  book,
  bookName,
  chapter,
  verses,
  initialHighlights,
  initialNotes,
  previousHref,
  nextHref,
}: VerseReaderProps) {
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Record<string, string>>(initialHighlights);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [noteDraft, setNoteDraft] = useState<{ verse: number; text: string } | null>(null);
  const [explanations, setExplanations] = useState<Record<string, BibleVerseExplanation>>({});
  const [explainingVerse, setExplainingVerse] = useState<number | null>(null);
  const [explainError, setExplainError] = useState<{ verse: number; message: string; blocked?: boolean } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  // Painel de anotações do capítulo: fixo ao lado no desktop (lg+),
  // aqui vira um modal aberto por um ícone — mesmo conteúdo, só o
  // jeito de mostrar muda por tamanho de tela.
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  function toggleSelect(verseNumber: number) {
    setSelectedVerse((current) => (current === verseNumber ? null : verseNumber));
    setNoteDraft(null);
    setExplainError(null);
  }

  // Clique numa anotação no painel lateral (desktop) — abre o painel do
  // versículo e rola até ele, sem duplicar os controles de edição que
  // já existem por versículo.
  function jumpToVerse(verseNumber: number) {
    setSelectedVerse(verseNumber);
    setNoteDraft(null);
    setExplainError(null);
    setShowNotesPanel(false);
    document.getElementById(`v-${verseNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleHighlight(verseNumber: number, color: string) {
    const verseId = makeVerseId(book, chapter, verseNumber);
    const previous = highlights[verseId];
    setHighlights((current) => ({ ...current, [verseId]: color }));
    startTransition(async () => {
      const result = await setHighlightAction(verseId, color);
      if (!result.success) {
        setHighlights((current) => {
          const next = { ...current };
          if (previous) next[verseId] = previous;
          else delete next[verseId];
          return next;
        });
      }
    });
  }

  function handleRemoveHighlight(verseNumber: number) {
    const verseId = makeVerseId(book, chapter, verseNumber);
    const previous = highlights[verseId];
    setHighlights((current) => {
      const next = { ...current };
      delete next[verseId];
      return next;
    });
    startTransition(async () => {
      const result = await removeHighlightAction(verseId);
      if (!result.success && previous) {
        setHighlights((current) => ({ ...current, [verseId]: previous }));
      }
    });
  }

  function openNoteDraft(verseNumber: number) {
    const verseId = makeVerseId(book, chapter, verseNumber);
    setNoteDraft({ verse: verseNumber, text: notes[verseId] ?? "" });
  }

  function saveNoteDraft() {
    if (!noteDraft) return;
    const verseId = makeVerseId(book, chapter, noteDraft.verse);
    const text = noteDraft.text.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await saveNoteAction(verseId, text);
      if (result.success) {
        setNotes((current) => ({ ...current, [verseId]: text }));
        setNoteDraft(null);
      }
    });
  }

  function removeNote(verseNumber: number) {
    const verseId = makeVerseId(book, chapter, verseNumber);
    startTransition(async () => {
      const result = await deleteNoteAction(verseId);
      if (result.success) {
        setNotes((current) => {
          const next = { ...current };
          delete next[verseId];
          return next;
        });
        setNoteDraft(null);
      }
    });
  }

  function handleExplain(verse: BibleVerse) {
    const verseId = makeVerseId(book, chapter, verse.verse);
    if (explanations[verseId]) return; // já explicado nesta sessão
    setExplainError(null);
    setExplainingVerse(verse.verse);
    startTransition(async () => {
      const reference = `${bookName} ${chapter}:${verse.verse}`;
      const result = await explainVerseAction(verseId, reference, verse.text);
      setExplainingVerse(null);
      if (result.status === "explained") {
        setExplanations((current) => ({ ...current, [verseId]: result.explanation }));
        return;
      }
      if (result.status === "blocked") {
        setExplainError({ verse: verse.verse, message: result.message, blocked: true });
        return;
      }
      setExplainError({ verse: verse.verse, message: result.message });
    });
  }

  const notedVerses = verses.filter((verse) => notes[makeVerseId(book, chapter, verse.verse)]);

  // Conteúdo compartilhado entre o painel fixo (desktop) e o modal
  // (mobile) — mesma lista, só muda o jeito de mostrar.
  const notesListContent =
    notedVerses.length === 0 ? (
      <p className="text-sm text-muted">
        Toque em um versículo e anote — suas anotações aparecem aqui.
      </p>
    ) : (
      <ul className="flex flex-col gap-2">
        {notedVerses.map((verse) => {
          const verseId = makeVerseId(book, chapter, verse.verse);
          return (
            <li key={verse.verse}>
              <button
                type="button"
                onClick={() => jumpToVerse(verse.verse)}
                className="flex w-full flex-col gap-1 rounded-xl border border-card-border bg-card-active px-3 py-2 text-left transition-colors hover:border-primary/40"
              >
                <span className="text-xs font-semibold text-accent">
                  {bookName} {chapter}:{verse.verse}
                </span>
                <span className="line-clamp-3 text-sm italic text-muted">{notes[verseId]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );

  return (
    <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {bookName} {chapter}
          </h1>
          <p className="text-sm text-muted">Toque em um versículo para grifar, anotar ou explicar.</p>
        </div>
        {/* No desktop as anotações já ficam fixas no painel ao lado —
            este botão é só pro mobile, que não tem espaço pra isso. */}
        <button
          type="button"
          onClick={() => setShowNotesPanel(true)}
          aria-label="Ver anotações deste capítulo"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-card-border bg-card text-primary lg:hidden"
        >
          <PencilIcon className="h-4 w-4" />
          {notedVerses.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary-foreground">
              {notedVerses.length}
            </span>
          )}
        </button>
      </header>

      <div className="flex flex-col">
        {verses.map((verse) => {
          const verseId = makeVerseId(book, chapter, verse.verse);
          const highlightColor = highlights[verseId];
          const note = notes[verseId];
          const explanation = explanations[verseId];
          const isSelected = selectedVerse === verse.verse;

          return (
            <div key={verse.verse} id={`v-${verse.verse}`} className="flex scroll-mt-20 flex-col">
              <button
                type="button"
                onClick={() => toggleSelect(verse.verse)}
                className={`flex gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  highlightColor ? HIGHLIGHT_BG[highlightColor] : ""
                } ${isSelected ? "ring-2 ring-primary/40" : ""}`}
              >
                <span className="mt-0.5 shrink-0 text-xs font-bold text-accent">{verse.verse}</span>
                <span className="text-[16px] leading-[1.7] text-foreground">{verse.text}</span>
              </button>

              {note && !isSelected && (
                <p className="ml-7 mt-1 rounded-lg bg-card-active px-3 py-2 text-sm italic text-muted">
                  {note}
                </p>
              )}

              {isSelected && (
                <div className="ml-2 mt-1 flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {HIGHLIGHT_COLORS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={`Grifar de ${option.label.toLowerCase()}`}
                        onClick={() => handleHighlight(verse.verse, option.value)}
                        className={`h-7 w-7 rounded-full ${option.className} ${
                          highlightColor === option.value ? "ring-2 ring-offset-1 ring-primary" : ""
                        }`}
                      />
                    ))}
                    {highlightColor && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(verse.verse)}
                        className="flex h-7 items-center rounded-full px-2 text-xs font-medium text-muted underline underline-offset-4"
                      >
                        Remover grifo
                      </button>
                    )}
                    <span className="mx-1 h-5 w-px bg-card-border" />
                    <button
                      type="button"
                      onClick={() => openNoteDraft(verse.verse)}
                      className="flex h-8 items-center gap-1.5 rounded-full border border-card-border px-3 text-xs font-semibold text-primary"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Anotar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExplain(verse)}
                      disabled={explainingVerse === verse.verse}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {explainingVerse === verse.verse ? (
                        <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <SparkleIcon className="h-3.5 w-3.5" />
                      )}
                      Explicar com IA
                    </button>
                  </div>

                  {noteDraft !== null && noteDraft.verse === verse.verse && (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={noteDraft.text}
                        onChange={(e) => setNoteDraft({ verse: verse.verse, text: e.target.value })}
                        placeholder="Sua anotação sobre este versículo..."
                        rows={3}
                        className="min-h-[72px] rounded-xl border border-card-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveNoteDraft}
                          disabled={isPending || !noteDraft.text.trim()}
                          className="flex min-h-[36px] flex-1 items-center justify-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                        >
                          Salvar
                        </button>
                        {note && (
                          <button
                            type="button"
                            onClick={() => removeNote(verse.verse)}
                            className="flex min-h-[36px] items-center justify-center rounded-full border border-card-border px-3 text-xs font-medium text-muted"
                          >
                            Excluir
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNoteDraft(null)}
                          className="flex min-h-[36px] items-center justify-center rounded-full border border-card-border px-3 text-xs font-medium text-muted"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {note && noteDraft?.verse !== verse.verse && (
                    <div className="flex flex-col gap-2">
                      <p className="rounded-xl bg-card-active px-3 py-2 text-sm italic text-muted">
                        {note}
                      </p>
                      <Link
                        href={`/pregacao?passagem=${encodeURIComponent(
                          `${bookName} ${chapter}:${verse.verse}`,
                        )}&notas=${encodeURIComponent(truncateForSermon(note))}`}
                        className="flex min-h-[36px] items-center justify-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary-soft px-3 text-xs font-semibold text-primary"
                      >
                        <SparkleIcon className="h-3.5 w-3.5" />
                        Usar este estudo em uma pregação
                      </Link>
                    </div>
                  )}

                  {explanation && (
                    <div className="flex flex-col gap-2 rounded-xl bg-primary-soft px-3 py-3 text-sm text-foreground">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Contexto
                      </p>
                      <p>{explanation.contexto}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Explicação
                      </p>
                      <p>{explanation.explicacao}</p>
                      {explanation.palavra_original && (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                            Palavra no Original
                          </p>
                          <p>
                            <strong>{explanation.palavra_original.termo}</strong> (
                            {explanation.palavra_original.idioma}) —{" "}
                            {explanation.palavra_original.significado}
                          </p>
                        </>
                      )}
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Aplicação
                      </p>
                      <p>{explanation.aplicacao}</p>
                    </div>
                  )}

                  {explainError !== null && explainError.verse === verse.verse && (
                    <div className="flex flex-col gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                      <p>{explainError.message}</p>
                      {explainError.blocked && <TrialSubscribeButton />}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {previousHref ? (
          <Link
            href={previousHref}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl border border-card-border px-4 text-sm font-medium text-foreground"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Anterior
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl border border-card-border px-4 text-sm font-medium text-foreground"
          >
            Próximo
            <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </div>
      </div>

      {/* Painel de anotações do capítulo — só no desktop (lg+); no
          mobile a anotação já aparece embaixo do próprio versículo,
          não precisa de painel separado. Clicar rola até o versículo e
          abre o painel dele, sem duplicar os controles de edição. */}
      <aside className="hidden lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100vh-3rem)] lg:flex-col lg:gap-3 lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-card-border lg:bg-card lg:p-4">
        <h2 className="text-sm font-semibold text-foreground">Anotações deste capítulo</h2>
        {notesListContent}
      </aside>

      {/* Mesmo painel, como modal — só no mobile (o desktop já tem o
          <aside> fixo acima), aberto pelo ícone no cabeçalho. */}
      {showNotesPanel && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setShowNotesPanel(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex max-h-[70vh] w-full flex-col gap-3 rounded-t-2xl bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Anotações deste capítulo</h2>
              <button
                type="button"
                onClick={() => setShowNotesPanel(false)}
                aria-label="Fechar"
                className="text-muted"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto">{notesListContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}
