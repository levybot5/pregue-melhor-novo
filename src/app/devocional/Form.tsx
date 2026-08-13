"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { DevotionalContent, DevotionalMoment } from "@/services/ai";
import { DevotionalView } from "@/components/DevotionalView";
import { ContentToolbar } from "@/components/ContentToolbar";
import { ReadingHeader } from "@/components/reading";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { isLimitBlockReason } from "@/lib/billing-ui";
import { generateDevotionalAction } from "./actions";

const MOMENT_OPTIONS: { value: DevotionalMoment; label: string }[] = [
  { value: "manha", label: "Manhã" },
  { value: "noite", label: "Noite" },
  { value: "qualquer", label: "Qualquer momento" },
];

export function DevocionalForm({ initialRemaining }: { initialRemaining: number }) {
  const [isGenerating, startGenerating] = useTransition();

  const [moment, setMoment] = useState<DevotionalMoment>("qualquer");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [devotional, setDevotional] = useState<DevotionalContent | null>(null);

  function handleGenerate() {
    setErrorMessage(null);
    startGenerating(async () => {
      const result = await generateDevotionalAction({ moment });

      if (result.status === "blocked") {
        if (isLimitBlockReason(result.reason)) {
          setLimitNotice(result.message);
        } else {
          setErrorMessage(result.message);
        }
        return;
      }
      if (result.status === "generated") {
        setRemaining((r) => Math.max(0, r - 1));
        setDevotional(result.devotional);
        return;
      }
      setErrorMessage(result.message);
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

  // Não persistido: some ao trocar de página ou dar refresh. É
  // intencional — Devocional não faz parte da Biblioteca.
  if (devotional) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <ReadingHeader title={devotional.titulo} baseText={devotional.texto_base} />
        <DevotionalView devotional={devotional} />
        <ContentToolbar contentType="devocional" content={devotional} title={devotional.titulo} />
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setDevotional(null)}
            className="min-h-[44px] text-sm font-medium text-muted underline underline-offset-4"
          >
            Gerar outro devocional
          </button>
          <Link
            href="/"
            className="min-h-[44px] text-sm font-medium text-muted underline underline-offset-4"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Devocional</h1>
        <p className="text-muted">Uma reflexão bíblica para o seu dia.</p>
      </header>

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

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || remaining <= 0}
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
