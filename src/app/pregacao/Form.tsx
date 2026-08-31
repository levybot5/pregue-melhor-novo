"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { SermonContent, SermonInput } from "@/services/ai";
import { SermonView } from "@/components/SermonView";
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
import { SpinnerIcon, ChevronDownIcon } from "@/components/icons";
import { isLimitBlockReason, isTrialExhaustedReason, isSubscriptionExpiredReason } from "@/lib/billing-ui";
import { generateAndSaveSermon, saveSermon, type SermonActionResult } from "./actions";
import { PASSAGE_MAX_LENGTH, PASSAGE_MIN_LENGTH, THEME_MAX_LENGTH, NOTES_MAX_LENGTH } from "./constants";

const FORMAT_OPTIONS: { value: SermonInput["format"] & string; label: string }[] = [
  { value: "expositiva", label: "Expositiva" },
  { value: "tematica", label: "Temática" },
  { value: "textual", label: "Textual" },
  { value: "evangelistica", label: "Evangelística" },
  { value: "doutrinaria", label: "Doutrinária" },
];

const AUDIENCE_OPTIONS: { value: SermonInput["audience"]; label: string }[] = [
  { value: "geral", label: "Igreja em Geral" },
  { value: "jovens", label: "Jovens" },
  { value: "adolescentes", label: "Adolescentes" },
  { value: "criancas", label: "Crianças" },
  { value: "mulheres", label: "Mulheres" },
  { value: "homens", label: "Homens" },
  { value: "lideres", label: "Líderes" },
  { value: "obreiros", label: "Obreiros" },
];

const STYLE_OPTIONS: { value: SermonInput["style"]; label: string }[] = [
  { value: "simples", label: "Simples" },
  { value: "ensino", label: "Ensino" },
  { value: "reflexivo", label: "Reflexivo" },
  { value: "impactante", label: "Impactante" },
  { value: "pastoral", label: "Pastoral" },
  { value: "devocional", label: "Devocional" },
];

const DEPTH_OPTIONS: { value: SermonInput["depth"]; label: string }[] = [
  { value: "basica", label: "Básica" },
  { value: "intermediaria", label: "Intermediária" },
  { value: "profunda", label: "Profunda" },
  { value: "teologica", label: "Teológica" },
];

const DURATION_OPTIONS: { value: SermonInput["duration"]; label: string }[] = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
];

const BIBLE_VERSION_OPTIONS: { value: SermonInput["bibleVersion"]; label: string }[] = [
  { value: "padrao", label: "Padrão (recomendado)" },
  { value: "ara", label: "Almeida Revista e Atualizada (ARA)" },
  { value: "arc", label: "Almeida Revista e Corrigida (ARC)" },
  { value: "naa", label: "Nova Almeida Atualizada (NAA)" },
  { value: "nvi", label: "Nova Versão Internacional (NVI)" },
  { value: "ntlh", label: "Nova Tradução na Linguagem de Hoje (NTLH)" },
  { value: "acf", label: "Almeida Corrigida Fiel (ACF)" },
];

type PregacaoFormProps = {
  mode: "subscriber" | "trial" | "expired";
  initialRemaining: number;
  // Só vêm preenchidos ao chegar aqui a partir de "Usar este estudo em
  // uma pregação" na Bíblia Guiada (ver VerseReader.tsx) — ausentes,
  // o formulário se comporta exatamente como sempre se comportou.
  initialPassage?: string;
  initialNotes?: string;
};

export function PregacaoForm({
  mode,
  initialRemaining,
  initialPassage,
  initialNotes,
}: PregacaoFormProps) {
  const isTrial = mode === "trial";
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [passage, setPassage] = useState(initialPassage ?? "");
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState<SermonInput["format"]>(null);
  const [audience, setAudience] = useState<SermonInput["audience"]>("geral");
  const [duration, setDuration] = useState<SermonInput["duration"]>("30");
  const [style, setStyle] = useState<SermonInput["style"]>("simples");
  const [depth, setDepth] = useState<SermonInput["depth"]>("intermediaria");
  const [bibleVersion, setBibleVersion] = useState<SermonInput["bibleVersion"]>("padrao");
  const [notes, setNotes] = useState((initialNotes ?? "").slice(0, NOTES_MAX_LENGTH));
  const [showMoreOptions, setShowMoreOptions] = useState(Boolean(initialNotes));
  const [showPrefillNotice, setShowPrefillNotice] = useState(Boolean(initialPassage || initialNotes));

  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [pendingSermon, setPendingSermon] = useState<SermonContent | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  // Ao trocar do formulário (rolado até o botão "Gerar") pra tela de
  // resultado, volta pro topo — sem isso a página fica no meio, onde o
  // usuário estava rolado quando clicou em gerar.
  useEffect(() => {
    if (pendingSermon || trialExhausted || subscriptionExpired || limitNotice) {
      window.scrollTo({ top: 0 });
    }
  }, [pendingSermon, trialExhausted, subscriptionExpired, limitNotice]);

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
        passage,
        theme,
        format,
        audience,
        duration,
        style,
        depth,
        bibleVersion,
        notes,
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

  if (pendingSermon) {
    return (
      <>
        <AppHeader backHref="/" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
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
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-4 lg:pb-10">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Pregação Completa
          </h1>
          <p className="text-sm text-muted">Crie uma mensagem estruturada do início ao fim.</p>
        </div>
        {isTrial && <TrialSubscribeButton />}
      </header>

      {showPrefillNotice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-card-active px-3 py-2 text-xs text-foreground">
          <span>
            Preenchido a partir do seu estudo
            {initialPassage ? ` em ${initialPassage}` : ""}.
          </span>
          <button
            type="button"
            onClick={() => setShowPrefillNotice(false)}
            aria-label="Dispensar aviso"
            className="shrink-0 text-muted"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-foreground">
            Texto bíblico ou passagem
          </span>
          <input
            type="text"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder="Ex: Salmo 23, João 3:16, fé em tempos difíceis..."
            minLength={PASSAGE_MIN_LENGTH}
            maxLength={PASSAGE_MAX_LENGTH}
            className="min-h-[44px] rounded-xl border border-card-border bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <span className="text-right text-xs text-muted">
            {passage.length}/{PASSAGE_MAX_LENGTH}
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-foreground">
            Tema <span className="font-normal text-muted">(opcional)</span>
          </span>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: perdão, esperança, família..."
            maxLength={THEME_MAX_LENGTH}
            className="min-h-[44px] rounded-xl border border-card-border bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-semibold text-foreground">Duração</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`min-h-[40px] rounded-xl border px-1 text-sm font-medium ${
                  duration === option.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-card-border bg-card text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => setShowMoreOptions((current) => !current)}
          aria-expanded={showMoreOptions}
          className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl border border-card-border bg-card text-sm font-semibold text-primary"
        >
          Mais opções
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${showMoreOptions ? "rotate-180" : ""}`}
          />
        </button>

        {showMoreOptions && (
          <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card-active p-3">
            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-semibold text-foreground">Estilo</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStyle(option.value)}
                    className={`min-h-[40px] rounded-xl border px-1.5 text-xs font-medium ${
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

            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-semibold text-foreground">
                Formato da mensagem <span className="font-normal text-muted">(opcional)</span>
              </legend>
              <div className="grid grid-cols-2 gap-1.5">
                {FORMAT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormat((current) => (current === option.value ? null : option.value))
                    }
                    className={`min-h-[40px] rounded-xl border px-2 text-xs font-medium ${
                      format === option.value
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-card-border bg-card text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-semibold text-foreground">Público</legend>
              <div className="grid grid-cols-2 gap-1.5">
                {AUDIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAudience(option.value)}
                    className={`min-h-[40px] rounded-xl border px-2 text-xs font-medium ${
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

            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-semibold text-foreground">Profundidade</legend>
              <div className="grid grid-cols-2 gap-1.5">
                {DEPTH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDepth(option.value)}
                    className={`min-h-[40px] rounded-xl border px-2 text-xs font-medium ${
                      depth === option.value
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-card-border bg-card text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Versão da Bíblia</span>
              <select
                value={bibleVersion}
                onChange={(e) => setBibleVersion(e.target.value as SermonInput["bibleVersion"])}
                className="min-h-[40px] rounded-xl border border-card-border bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary"
              >
                {BIBLE_VERSION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                Observações adicionais <span className="font-normal text-muted">(opcional)</span>
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: quero abordar perdão, incluir uma aplicação para famílias..."
                maxLength={NOTES_MAX_LENGTH}
                rows={2}
                className="min-h-[64px] rounded-xl border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
              <span className="text-right text-xs text-muted">
                {notes.length}/{NOTES_MAX_LENGTH}
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || remaining <= 0 || passage.trim().length < PASSAGE_MIN_LENGTH}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
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
      <BottomNav />
    </>
  );
}
