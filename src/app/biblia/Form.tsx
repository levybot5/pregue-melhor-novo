"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { BibleStudyContent } from "@/services/ai";
import { BibleStudyView } from "@/components/BibleStudyView";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { isLimitBlockReason } from "@/lib/billing-ui";
import {
  generateAndSaveBibleStudy,
  saveBibleStudy,
  type BibleStudyActionResult,
} from "./actions";
import { PASSAGE_MAX_LENGTH, PASSAGE_MIN_LENGTH } from "./constants";

export function BibliaForm({ initialRemaining }: { initialRemaining: number }) {
  const router = useRouter();
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [passage, setPassage] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [pendingStudy, setPendingStudy] = useState<BibleStudyContent | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  function handleResult(result: BibleStudyActionResult) {
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
      setPendingStudy(null);
      setSaveWarning(null);
      router.push(`/biblioteca/${result.contentId}`);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingStudy(result.study);
      setSaveWarning(result.message);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleGenerate() {
    setErrorMessage(null);
    setSaveWarning(null);
    startGenerating(async () => {
      const result = await generateAndSaveBibleStudy(passage);
      handleResult(result);
    });
  }

  function handleRetrySave() {
    if (!pendingStudy) return;
    startSaving(async () => {
      const result = await saveBibleStudy(pendingStudy);
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

  if (pendingStudy) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
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
        <BibleStudyView study={pendingStudy} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bíblia Explicada
        </h1>
        <p className="text-muted">Entenda uma passagem bíblica com clareza.</p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Passagem bíblica</span>
        <input
          type="text"
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="Ex: João 3:16, Salmo 23, Romanos 8:28"
          minLength={PASSAGE_MIN_LENGTH}
          maxLength={PASSAGE_MAX_LENGTH}
          className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
        />
        <span className="text-right text-xs text-muted">
          {passage.length}/{PASSAGE_MAX_LENGTH}
        </span>
      </label>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || remaining <= 0 || passage.trim().length < PASSAGE_MIN_LENGTH}
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating ? "Explicando..." : "Explicar Passagem"}
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
