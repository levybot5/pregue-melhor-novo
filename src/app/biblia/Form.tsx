"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { BibleStudyContent } from "@/services/ai";
import { BibleStudyView } from "@/components/BibleStudyView";
import { BackLink, ReadingHeader } from "@/components/reading";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { TrialCounter } from "@/components/TrialCounter";
import { TrialSubscribeButton } from "@/components/TrialSubscribeButton";
import { TrialPaywallNotice } from "@/components/TrialPaywallNotice";
import { RenewalNotice } from "@/components/RenewalNotice";
import { isLimitBlockReason, isTrialExhaustedReason, isSubscriptionExpiredReason } from "@/lib/billing-ui";
import {
  generateAndSaveBibleStudy,
  saveBibleStudy,
  type BibleStudyActionResult,
} from "./actions";
import { PASSAGE_MAX_LENGTH, PASSAGE_MIN_LENGTH } from "./constants";

const EXAMPLE_PASSAGES = ["João 3:16", "Salmo 23", "Romanos 8:28", "Filipenses 4:6-7"];

type BibliaFormProps = {
  mode: "subscriber" | "trial" | "expired";
  initialRemaining: number;
};

export function BibliaForm({ mode, initialRemaining }: BibliaFormProps) {
  const isTrial = mode === "trial";
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [passage, setPassage] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [pendingStudy, setPendingStudy] = useState<BibleStudyContent | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  function handleResult(result: BibleStudyActionResult) {
    if (result.status === "blocked") {
      if (isSubscriptionExpiredReason(result.reason)) {
        setSubscriptionExpired(true);
      } else if (isTrialExhaustedReason(result.reason)) {
        setTrialExhausted(true);
      } else if (isLimitBlockReason(result.reason)) {
        setLimitNotice(result.message);
      } else {
        setErrorMessage(result.message);
      }
      return;
    }
    if (result.status === "saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingStudy(result.study);
      setSavedContentId(result.contentId);
      setSaveWarning(null);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingStudy(result.study);
      setSavedContentId(null);
      setSaveWarning(result.message);
      return;
    }
    if (result.status === "generated") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingStudy(result.study);
      setSavedContentId(null);
      setSaveWarning(null);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleNewStudy() {
    setPendingStudy(null);
    setSavedContentId(null);
    setSaveWarning(null);
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

  if (mode === "expired" || subscriptionExpired) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
        <BackLink href="/" />
        <RenewalNotice />
      </main>
    );
  }

  if (trialExhausted) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
        <BackLink href="/" />
        <TrialPaywallNotice />
      </main>
    );
  }

  if (limitNotice) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
        <BackLink href="/" />
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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <BackLink href="/" />
        <ReadingHeader title={pendingStudy.titulo} baseText={pendingStudy.passagem} />
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

        {savedContentId && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-card px-4 py-3 text-sm">
            <span className="text-muted">Salvo na Biblioteca.</span>
            <Link
              href={`/biblioteca/${savedContentId}`}
              className="font-medium text-primary underline underline-offset-4"
            >
              Ver na Biblioteca
            </Link>
          </div>
        )}

        {isTrial && !saveWarning && (
          <p className="text-center text-xs text-muted">
            Gerado em modo teste — este resultado não foi salvo. Assine para salvar na Biblioteca.
          </p>
        )}

        <BibleStudyView study={pendingStudy} />

        <button
          type="button"
          onClick={handleNewStudy}
          className="flex min-h-[52px] items-center justify-center rounded-2xl border border-card-border bg-card px-5 font-semibold text-foreground"
        >
          Explicar outra passagem
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/" />
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bíblia Explicada
          </h1>
          <p className="text-muted">Entenda uma passagem bíblica com clareza.</p>
        </div>
        {isTrial && <TrialSubscribeButton />}
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

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PASSAGES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPassage(example)}
            className="min-h-[36px] rounded-full border border-card-border bg-card px-3 text-sm text-muted"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || remaining <= 0 || passage.trim().length < PASSAGE_MIN_LENGTH}
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating ? "Explicando..." : "Explicar Passagem"}
        </button>
        {isTrial ? <TrialCounter remaining={remaining} /> : <GenerationCounter remaining={remaining} />}
      </div>

      {errorMessage && (
        <p role="status" className="text-red-600">
          {errorMessage}
        </p>
      )}
    </main>
  );
}
