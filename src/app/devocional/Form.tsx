"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DevotionalContent, DevotionalMoment } from "@/services/ai";
import { DevotionalView } from "@/components/DevotionalView";
import { ReadingHeader } from "@/components/reading";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { isLimitBlockReason } from "@/lib/billing-ui";
import {
  generateAndSaveDevotional,
  saveDevotional,
  type DevotionalActionResult,
} from "./actions";
import { THEME_MAX_LENGTH, THEME_MIN_LENGTH } from "./constants";

const MOMENT_OPTIONS: { value: DevotionalMoment; label: string }[] = [
  { value: "manha", label: "Manhã" },
  { value: "noite", label: "Noite" },
  { value: "qualquer", label: "Qualquer momento" },
];

export function DevocionalForm({ initialRemaining }: { initialRemaining: number }) {
  const router = useRouter();
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [themeOrPassage, setThemeOrPassage] = useState("");
  const [moment, setMoment] = useState<DevotionalMoment>("qualquer");

  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [pendingDevotional, setPendingDevotional] = useState<DevotionalContent | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  function handleResult(result: DevotionalActionResult) {
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
      setPendingDevotional(null);
      setSaveWarning(null);
      router.push(`/biblioteca/${result.contentId}`);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingDevotional(result.devotional);
      setSaveWarning(result.message);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleGenerate() {
    setErrorMessage(null);
    setSaveWarning(null);
    startGenerating(async () => {
      const result = await generateAndSaveDevotional({ themeOrPassage, moment });
      handleResult(result);
    });
  }

  function handleRetrySave() {
    if (!pendingDevotional) return;
    startSaving(async () => {
      const result = await saveDevotional(pendingDevotional);
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

  if (pendingDevotional) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <ReadingHeader title={pendingDevotional.titulo} baseText={pendingDevotional.texto_base} />
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
        <DevotionalView devotional={pendingDevotional} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Devocional</h1>
        <p className="text-muted">Uma reflexão curta e prática para o seu dia.</p>
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
            placeholder="Ex: confiança em Deus, Salmo 46, gratidão, ansiedade"
            minLength={THEME_MIN_LENGTH}
            maxLength={THEME_MAX_LENGTH}
            className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
          />
          <span className="text-right text-xs text-muted">
            {themeOrPassage.length}/{THEME_MAX_LENGTH}
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-foreground">Momento</legend>
          <div className="grid grid-cols-3 gap-2">
            {MOMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMoment(option.value)}
                className={`min-h-[48px] rounded-2xl border px-2 text-sm font-medium ${
                  moment === option.value
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
            isGenerating || remaining <= 0 || themeOrPassage.trim().length < THEME_MIN_LENGTH
          }
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating ? "Gerando..." : "Gerar Devocional"}
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
