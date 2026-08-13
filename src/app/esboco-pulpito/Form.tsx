"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SermonOutlineContent, SermonOutlineSummaryLevel } from "@/services/ai";
import { SermonOutlineView } from "@/components/SermonOutlineView";
import { ReadingHeader } from "@/components/reading";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { isLimitBlockReason } from "@/lib/billing-ui";
import {
  generateAndSaveSermonOutline,
  saveSermonOutline,
  type SermonOutlineActionResult,
} from "./actions";
import { SERMON_MAX_LENGTH, SERMON_MIN_LENGTH } from "./constants";

const LEVEL_OPTIONS: { value: SermonOutlineSummaryLevel; label: string }[] = [
  { value: "enxuto", label: "Enxuto" },
  { value: "equilibrado", label: "Equilibrado" },
  { value: "detalhado", label: "Detalhado" },
];

export function EsbocoPulpitoForm({ initialRemaining }: { initialRemaining: number }) {
  const router = useRouter();
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [sermonText, setSermonText] = useState("");
  const [level, setLevel] = useState<SermonOutlineSummaryLevel>("equilibrado");

  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [pendingOutline, setPendingOutline] = useState<SermonOutlineContent | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  function handleResult(result: SermonOutlineActionResult) {
    if (result.status === "blocked") {
      if (isLimitBlockReason(result.reason)) {
        setLimitNotice(result.message);
      } else {
        setErrorMessage(result.message);
      }
      return;
    }
    if (result.status === "saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingOutline(null);
      setSaveWarning(null);
      router.push(`/biblioteca/${result.contentId}`);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingOutline(result.outline);
      setSaveWarning(result.message);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleGenerate() {
    setErrorMessage(null);
    setSaveWarning(null);
    startGenerating(async () => {
      const result = await generateAndSaveSermonOutline({ sermonText, level });
      handleResult(result);
    });
  }

  function handleRetrySave() {
    if (!pendingOutline) return;
    startSaving(async () => {
      const result = await saveSermonOutline(pendingOutline);
      handleResult(result);
    });
  }

  if (limitNotice) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
        <GenerationBlockedNotice
          message={limitNotice}
          variant="limit"
          onDismiss={() => setLimitNotice(null)}
        />
      </main>
    );
  }

  if (pendingOutline) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <ReadingHeader title={pendingOutline.titulo} baseText={pendingOutline.texto_base} />
        {saveWarning && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <p>{saveWarning}</p>
            <button
              type="button"
              onClick={handleRetrySave}
              disabled={isSaving}
              className="mt-3 min-h-[44px] rounded-xl bg-red-600 px-4 font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : "Tentar salvar novamente"}
            </button>
          </div>
        )}
        <SermonOutlineView outline={pendingOutline} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pregação para Esboço
        </h1>
        <p className="text-muted">
          Transforme sua pregação em um esboço organizado para ministrar com mais clareza.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Sua Pregação</span>
          <textarea
            value={sermonText}
            onChange={(e) => setSermonText(e.target.value)}
            placeholder="Cole aqui a pregação que você deseja transformar em esboço..."
            maxLength={SERMON_MAX_LENGTH}
            rows={12}
            className="min-h-[240px] rounded-2xl border border-card-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-primary"
          />
          <span className="text-right text-xs text-muted">
            {sermonText.length.toLocaleString("pt-BR")}/{SERMON_MAX_LENGTH.toLocaleString("pt-BR")}
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-foreground">Nível de Resumo</legend>
          <div className="grid grid-cols-3 gap-2">
            {LEVEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLevel(option.value)}
                className={`min-h-[48px] rounded-2xl border px-2 text-sm font-medium ${
                  level === option.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-card-border bg-card text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={
            isGenerating || remaining <= 0 || sermonText.trim().length < SERMON_MIN_LENGTH
          }
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating ? "Criando esboço..." : "Criar Esboço"}
        </button>
        <GenerationCounter remaining={remaining} />
      </div>

      {errorMessage && (
        <p role="status" className="text-red-600">
          {errorMessage}
        </p>
      )}

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
