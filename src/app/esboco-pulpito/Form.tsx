"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { SermonOutlineContent, SermonOutlineSummaryLevel } from "@/services/ai";
import { SermonOutlineView } from "@/components/SermonOutlineView";
import { ContentToolbar } from "@/components/ContentToolbar";
import { ReadingHeader } from "@/components/reading";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { TrialCounter } from "@/components/TrialCounter";
import { TrialSubscribeButton } from "@/components/TrialSubscribeButton";
import { TrialPaywallNotice } from "@/components/TrialPaywallNotice";
import { RenewalNotice } from "@/components/RenewalNotice";
import { isLimitBlockReason, isTrialExhaustedReason, isSubscriptionExpiredReason } from "@/lib/billing-ui";
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

type EsbocoPulpitoFormProps = {
  mode: "subscriber" | "trial" | "expired";
  initialRemaining: number;
};

export function EsbocoPulpitoForm({ mode, initialRemaining }: EsbocoPulpitoFormProps) {
  const isTrial = mode === "trial";
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [sermonText, setSermonText] = useState("");
  const [level, setLevel] = useState<SermonOutlineSummaryLevel>("equilibrado");

  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [pendingOutline, setPendingOutline] = useState<SermonOutlineContent | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  function handleResult(result: SermonOutlineActionResult) {
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
      setPendingOutline(result.outline);
      setSavedContentId(result.contentId);
      setSaveWarning(null);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingOutline(result.outline);
      setSavedContentId(null);
      setSaveWarning(result.message);
      return;
    }
    if (result.status === "generated") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingOutline(result.outline);
      setSavedContentId(null);
      setSaveWarning(null);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleNewOutline() {
    setPendingOutline(null);
    setSavedContentId(null);
    setSaveWarning(null);
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

  if (mode === "expired" || subscriptionExpired) {
    return (
      <>
        <AppHeader backHref="/" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
          <RenewalNotice />
        </main>
        <BottomNav />
      </>
    );
  }

  if (trialExhausted) {
    return (
      <>
        <AppHeader backHref="/" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
          <TrialPaywallNotice />
        </main>
        <BottomNav />
      </>
    );
  }

  if (limitNotice) {
    return (
      <>
        <AppHeader backHref="/" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
          <GenerationBlockedNotice
            message={limitNotice}
            variant="limit"
            onDismiss={() => setLimitNotice(null)}
          />
        </main>
        <BottomNav />
      </>
    );
  }

  if (pendingOutline) {
    return (
      <>
        <AppHeader backHref="/" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
        <ReadingHeader title={pendingOutline.titulo} />
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

        <SermonOutlineView outline={pendingOutline} />

        <ContentToolbar
          contentType="esboco_pulpito"
          content={pendingOutline}
          title={pendingOutline.titulo}
        />

        <button
          type="button"
          onClick={handleNewOutline}
          className="flex min-h-[52px] items-center justify-center rounded-2xl border border-card-border bg-card px-5 font-semibold text-foreground"
        >
          Criar outro esboço
        </button>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pregação para Esboço
          </h1>
          <p className="text-muted">
            Transforme sua pregação em um esboço organizado para ministrar com mais clareza.
          </p>
        </div>
        {isTrial && <TrialSubscribeButton />}
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
        {isTrial ? <TrialCounter remaining={remaining} /> : <GenerationCounter remaining={remaining} />}
      </div>

      {errorMessage && (
        <p role="status" className="text-red-600">
          {errorMessage}
        </p>
      )}
      </main>
      <BottomNav />
    </>
  );
}
