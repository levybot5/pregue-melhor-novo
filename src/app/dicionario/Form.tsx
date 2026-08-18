"use client";

import { useState, useTransition } from "react";
import type { BibleDictionaryEntry } from "@/services/ai";
import { DictionaryEntryView } from "@/components/DictionaryEntryView";
import { GenerationCounter } from "@/components/GenerationCounter";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { TrialCounter } from "@/components/TrialCounter";
import { TrialSubscribeButton } from "@/components/TrialSubscribeButton";
import { TrialPaywallNotice } from "@/components/TrialPaywallNotice";
import { RenewalNotice } from "@/components/RenewalNotice";
import { BackLink } from "@/components/reading";
import { CopyIcon, SearchIcon, SpinnerIcon } from "@/components/icons";
import { isLimitBlockReason, isTrialExhaustedReason, isSubscriptionExpiredReason } from "@/lib/billing-ui";
import { formatBibleDictionaryForCopy } from "@/lib/copy-content";
import { searchBibleDictionaryAction, type DictionaryActionResult } from "./actions";
import { QUERY_MAX_LENGTH, QUERY_MIN_LENGTH } from "./constants";

const EXAMPLE_QUERIES = ["Graça", "Getsêmani", "Davi", "Êxodo"];

type DicionarioFormProps = {
  mode: "subscriber" | "trial" | "expired";
  initialRemaining: number;
};

export function DicionarioForm({ mode, initialRemaining }: DicionarioFormProps) {
  const isTrial = mode === "trial";
  const [isGenerating, startGenerating] = useTransition();

  const [query, setQuery] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [entry, setEntry] = useState<BibleDictionaryEntry | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copiar");

  function handleResult(result: DictionaryActionResult) {
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
    if (result.status === "generated") {
      setRemaining((r) => Math.max(0, r - 1));
      setEntry(result.entry);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleSearch() {
    setErrorMessage(null);
    startGenerating(async () => {
      const result = await searchBibleDictionaryAction(query);
      handleResult(result);
    });
  }

  async function handleCopy() {
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(formatBibleDictionaryForCopy(entry));
      setCopyLabel("Copiado!");
    } catch {
      setCopyLabel("Erro ao copiar");
    } finally {
      setTimeout(() => setCopyLabel("Copiar"), 2000);
    }
  }

  function handleNewSearch() {
    setEntry(null);
    setQuery("");
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

  if (entry) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <BackLink href="/" />
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{entry.termo}</h1>
        </header>

        <DictionaryEntryView entry={entry} />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-card-border bg-card px-3.5 text-sm font-medium text-primary"
          >
            <CopyIcon className="h-4 w-4" />
            {copyLabel}
          </button>
          <button
            type="button"
            onClick={handleNewSearch}
            className="flex min-h-[44px] items-center justify-center rounded-full border border-card-border bg-card px-3.5 text-sm font-medium text-primary"
          >
            Nova pesquisa
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/" />
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-primary">
            <SearchIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dicionário Bíblico
            </h1>
          </span>
          <p className="text-muted">Pesquise termos, lugares e personagens da Bíblia.</p>
        </div>
        {isTrial && <TrialSubscribeButton />}
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Termo</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquise um termo, lugar ou personagem..."
          minLength={QUERY_MIN_LENGTH}
          maxLength={QUERY_MAX_LENGTH}
          className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            className="min-h-[36px] rounded-full border border-card-border bg-card px-3 text-sm text-muted"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleSearch}
          disabled={isGenerating || remaining <= 0 || query.trim().length < QUERY_MIN_LENGTH}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating && <SpinnerIcon className="h-5 w-5 animate-spin" />}
          {isGenerating ? "Pesquisando..." : "Pesquisar"}
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
