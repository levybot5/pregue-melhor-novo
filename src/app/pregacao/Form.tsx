"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { SermonContent, SermonInput } from "@/services/ai";
import { SermonView } from "@/components/SermonView";
import { ContentToolbar } from "@/components/ContentToolbar";
import { BackLink, ReadingHeader } from "@/components/reading";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { TrialCounter } from "@/components/TrialCounter";
import { TrialSubscribeButton } from "@/components/TrialSubscribeButton";
import { TrialPaywallNotice } from "@/components/TrialPaywallNotice";
import { RenewalNotice } from "@/components/RenewalNotice";
import { SpinnerIcon } from "@/components/icons";
import { isLimitBlockReason, isTrialExhaustedReason, isSubscriptionExpiredReason } from "@/lib/billing-ui";
import { generateAndSaveSermon, saveSermon, type SermonActionResult } from "./actions";
import { THEME_MAX_LENGTH, THEME_MIN_LENGTH } from "./constants";

const AUDIENCE_OPTIONS: { value: SermonInput["audience"]; label: string }[] = [
  { value: "domingo", label: "Culto de Domingo" },
  { value: "ensino", label: "Culto de Ensino" },
  { value: "oracao", label: "Culto de Oração" },
  { value: "evangelistico", label: "Culto Evangelístico" },
  { value: "jovens", label: "Culto de Jovens" },
  { value: "mulheres", label: "Culto de Mulheres" },
  { value: "homens", label: "Culto de Homens" },
  { value: "santa_ceia", label: "Santa Ceia" },
  { value: "congresso", label: "Congresso / Conferência" },
  { value: "celula", label: "Célula / Pequeno Grupo" },
  { value: "outro", label: "Outro" },
];

const STYLE_OPTIONS: { value: SermonInput["style"]; label: string }[] = [
  { value: "expositivo", label: "Expositiva" },
  { value: "tematico", label: "Temática" },
  { value: "evangelistico", label: "Evangelística" },
  { value: "ensino_biblico", label: "Ensino Bíblico" },
  { value: "reflexiva", label: "Reflexiva" },
];

const DURATION_OPTIONS: {
  value: SermonInput["duration"];
  label: string;
  hint: string;
}[] = [
  { value: "curta", label: "Curta", hint: "10–15 min" },
  { value: "media", label: "Média", hint: "20–30 min" },
  { value: "completa", label: "Completa", hint: "40–60 min" },
];

type PregacaoFormProps = {
  mode: "subscriber" | "trial" | "expired";
  initialRemaining: number;
};

export function PregacaoForm({ mode, initialRemaining }: PregacaoFormProps) {
  const isTrial = mode === "trial";
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [themeOrPassage, setThemeOrPassage] = useState("");
  const [audience, setAudience] = useState<SermonInput["audience"]>("domingo");
  const [style, setStyle] = useState<SermonInput["style"]>("expositivo");
  const [duration, setDuration] = useState<SermonInput["duration"]>("media");

  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [pendingSermon, setPendingSermon] = useState<SermonContent | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  function handleResult(result: SermonActionResult) {
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
      setPendingSermon(result.sermon);
      setSavedContentId(result.contentId);
      setSaveWarning(null);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingSermon(result.sermon);
      setSavedContentId(null);
      setSaveWarning(result.message);
      return;
    }
    if (result.status === "generated") {
      // Trial sem login: gerou com sucesso, mas não existe usuário
      // para salvar na Biblioteca (ver services/billing/guard.ts).
      setRemaining((r) => Math.max(0, r - 1));
      setPendingSermon(result.sermon);
      setSavedContentId(null);
      setSaveWarning(null);
      return;
    }
    setErrorMessage(result.message);
  }

  // Volta pro formulário pra gerar outra pregação, sem sair da página —
  // a única "saída" daqui agora é essa, já que gerar não navega mais
  // sozinho pra Biblioteca.
  function handleNewSermon() {
    setPendingSermon(null);
    setSavedContentId(null);
    setSaveWarning(null);
  }

  function handleGenerate() {
    setErrorMessage(null);
    setSaveWarning(null);
    startGenerating(async () => {
      const result = await generateAndSaveSermon({
        themeOrPassage,
        audience,
        style,
        duration,
      });
      handleResult(result);
    });
  }

  function handleRetrySave() {
    if (!pendingSermon) return;
    startSaving(async () => {
      const result = await saveSermon(pendingSermon);
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

  if (pendingSermon) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <BackLink href="/" />
        <ReadingHeader title={pendingSermon.titulo} />

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

        <SermonView sermon={pendingSermon} />

        <ContentToolbar contentType="pregacao" content={pendingSermon} title={pendingSermon.titulo} />

        <button
          type="button"
          onClick={handleNewSermon}
          className="flex min-h-[52px] items-center justify-center rounded-2xl border border-card-border bg-card px-5 font-semibold text-foreground"
        >
          Gerar outra pregação
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
            Pregação Completa
          </h1>
          <p className="text-muted">Crie uma mensagem estruturada do início ao fim.</p>
        </div>
        {isTrial && <TrialSubscribeButton />}
      </header>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">
            Tema ou passagem bíblica
          </span>
          <input
            type="text"
            value={themeOrPassage}
            onChange={(e) => setThemeOrPassage(e.target.value)}
            placeholder="Ex: Salmo 23, oração, fé em tempos difíceis..."
            minLength={THEME_MIN_LENGTH}
            maxLength={THEME_MAX_LENGTH}
            className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
          />
          <span className="text-right text-xs text-muted">
            {themeOrPassage.length}/{THEME_MAX_LENGTH}
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-foreground">
            Onde vai ministrar
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {AUDIENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAudience(option.value)}
                className={`min-h-[48px] rounded-2xl border px-3 text-sm font-medium ${
                  audience === option.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-card-border bg-card text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-foreground">Estilo</legend>
          <div className="grid grid-cols-3 gap-2">
            {STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStyle(option.value)}
                className={`min-h-[48px] rounded-2xl border px-2 text-sm font-medium ${
                  style === option.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-card-border bg-card text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-foreground">Duração</legend>
          <div className="grid grid-cols-3 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`flex min-h-[52px] flex-col items-center justify-center rounded-2xl border px-2 text-sm font-medium ${
                  duration === option.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-card-border bg-card text-foreground"
                }`}
              >
                <span>{option.label}</span>
                <span className="text-xs text-muted">{option.hint}</span>
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
            isGenerating || remaining <= 0 || themeOrPassage.trim().length < THEME_MIN_LENGTH
          }
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating && <SpinnerIcon className="h-5 w-5 animate-spin" />}
          {isGenerating ? "Gerando..." : "Gerar Pregação"}
        </button>
        {isGenerating && (
          <p role="status" className="text-center text-sm text-muted">
            Preparando sua pregação... isso pode levar até 30 segundos.
          </p>
        )}
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
