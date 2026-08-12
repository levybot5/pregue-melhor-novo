"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  MinistryAudience,
  MinistryStyle,
  MinistryDuration,
  OutlineExpansionContent,
} from "@/services/ai";
import { OutlineExpansionView } from "@/components/OutlineExpansionView";
import { ReadingHeader } from "@/components/reading";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { isLimitBlockReason } from "@/lib/billing-ui";
import {
  generateAndSaveExpansion,
  saveExpansion,
  type OutlineExpansionActionResult,
} from "./actions";
import { OUTLINE_MAX_LENGTH, OUTLINE_MIN_LENGTH } from "./constants";

const AUDIENCE_OPTIONS: { value: MinistryAudience; label: string }[] = [
  { value: "domingo", label: "Domingo" },
  { value: "doutrina", label: "Doutrina" },
  { value: "jovens", label: "Jovens" },
  { value: "mulheres", label: "Mulheres" },
];

const STYLE_OPTIONS: { value: MinistryStyle; label: string }[] = [
  { value: "expositivo", label: "Expositivo" },
  { value: "tematico", label: "Temático" },
  { value: "evangelistico", label: "Evangelístico" },
];

const DURATION_OPTIONS: { value: MinistryDuration; label: string; hint: string }[] = [
  { value: "curta", label: "Curta", hint: "10–15 min" },
  { value: "media", label: "Média", hint: "20–30 min" },
  { value: "completa", label: "Completa", hint: "30–40 min" },
];

export function EsbocoPregacaoForm({ initialRemaining }: { initialRemaining: number }) {
  const router = useRouter();
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [outline, setOutline] = useState("");
  const [audience, setAudience] = useState<MinistryAudience>("domingo");
  const [style, setStyle] = useState<MinistryStyle>("expositivo");
  const [duration, setDuration] = useState<MinistryDuration>("media");

  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [pendingContent, setPendingContent] = useState<OutlineExpansionContent | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  function handleResult(result: OutlineExpansionActionResult) {
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
      setPendingContent(null);
      setSaveWarning(null);
      router.push(`/biblioteca/${result.contentId}`);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingContent(result.content);
      setSaveWarning(result.message);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleGenerate() {
    setErrorMessage(null);
    setSaveWarning(null);
    startGenerating(async () => {
      const result = await generateAndSaveExpansion({ outline, audience, style, duration });
      handleResult(result);
    });
  }

  function handleRetrySave() {
    if (!pendingContent) return;
    startSaving(async () => {
      const result = await saveExpansion(pendingContent);
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

  if (pendingContent) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <ReadingHeader title={pendingContent.titulo} baseText={pendingContent.texto_base} />
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
        <OutlineExpansionView content={pendingContent} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Esboço em Pregação
        </h1>
        <p className="text-muted">Transforme suas ideias em uma mensagem estruturada.</p>
      </header>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Cole seu esboço</span>
          <textarea
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder="Cole aqui os pontos e ideias que você já tem..."
            maxLength={OUTLINE_MAX_LENGTH}
            rows={8}
            className="min-h-[160px] rounded-2xl border border-card-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-primary"
          />
          <span className="text-right text-xs text-muted">
            {outline.length}/{OUTLINE_MAX_LENGTH}
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
            isGenerating || remaining <= 0 || outline.trim().length < OUTLINE_MIN_LENGTH
          }
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating ? "Transformando..." : "Transformar em Pregação"}
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
