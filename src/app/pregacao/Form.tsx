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
import { SpinnerIcon, ChevronDownIcon } from "@/components/icons";
import { isLimitBlockReason, isTrialExhaustedReason, isSubscriptionExpiredReason } from "@/lib/billing-ui";
import { generateAndSaveSermon, saveSermon, type SermonActionResult } from "./actions";
import { PASSAGE_MAX_LENGTH, PASSAGE_MIN_LENGTH, THEME_MAX_LENGTH, NOTES_MAX_LENGTH } from "./constants";

const MESSAGE_TYPE_OPTIONS: { value: SermonInput["messageType"] & string; label: string }[] = [
  { value: "expositiva", label: "Expositiva" },
  { value: "tematica", label: "Temática" },
  { value: "textual", label: "Textual" },
  { value: "evangelistica", label: "Evangelística" },
  { value: "doutrinaria", label: "Doutrinária" },
  { value: "encorajamento", label: "Encorajamento" },
  { value: "culto_jovens", label: "Culto de Jovens" },
  { value: "mulheres", label: "Mulheres" },
  { value: "homens", label: "Homens" },
  { value: "infantil", label: "Infantil" },
  { value: "escola_biblica", label: "Escola Bíblica" },
  { value: "missoes", label: "Missões" },
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
  { value: "evangelismo", label: "Evangelismo" },
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
  { value: "10", label: "10 min" },
  { value: "20", label: "20 min" },
  { value: "30", label: "30 min" },
  { value: "40", label: "40 min" },
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
};

export function PregacaoForm({ mode, initialRemaining }: PregacaoFormProps) {
  const isTrial = mode === "trial";
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [passage, setPassage] = useState("");
  const [theme, setTheme] = useState("");
  const [messageType, setMessageType] = useState<SermonInput["messageType"]>(null);
  const [audience, setAudience] = useState<SermonInput["audience"]>("geral");
  const [duration, setDuration] = useState<SermonInput["duration"]>("20");
  const [style, setStyle] = useState<SermonInput["style"]>("simples");
  const [depth, setDepth] = useState<SermonInput["depth"]>("intermediaria");
  const [bibleVersion, setBibleVersion] = useState<SermonInput["bibleVersion"]>("padrao");
  const [notes, setNotes] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

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
        passage,
        theme,
        messageType,
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
            Texto bíblico ou passagem
          </span>
          <input
            type="text"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder="Ex: Salmo 23, João 3:16, fé em tempos difíceis..."
            minLength={PASSAGE_MIN_LENGTH}
            maxLength={PASSAGE_MAX_LENGTH}
            className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
          />
          <span className="text-right text-xs text-muted">
            {passage.length}/{PASSAGE_MAX_LENGTH}
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">
            Tema <span className="font-normal text-muted">(opcional)</span>
          </span>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: perdão, esperança, família..."
            maxLength={THEME_MAX_LENGTH}
            className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-foreground">Duração</legend>
          <div className="grid grid-cols-5 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`min-h-[48px] rounded-2xl border px-1 text-sm font-medium ${
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
          className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-2xl border border-card-border bg-card text-sm font-semibold text-primary"
        >
          Mais opções
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${showMoreOptions ? "rotate-180" : ""}`}
          />
        </button>

        {showMoreOptions && (
          <div className="flex flex-col gap-5 rounded-2xl border border-card-border bg-card-active p-4">
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
              <legend className="text-sm font-semibold text-foreground">
                Tipo de mensagem <span className="font-normal text-muted">(opcional)</span>
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {MESSAGE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setMessageType((current) => (current === option.value ? null : option.value))
                    }
                    className={`min-h-[48px] rounded-2xl border px-3 text-sm font-medium ${
                      messageType === option.value
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
              <legend className="text-sm font-semibold text-foreground">Público</legend>
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
              <legend className="text-sm font-semibold text-foreground">Profundidade</legend>
              <div className="grid grid-cols-2 gap-2">
                {DEPTH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDepth(option.value)}
                    className={`min-h-[48px] rounded-2xl border px-3 text-sm font-medium ${
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

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Versão da Bíblia</span>
              <select
                value={bibleVersion}
                onChange={(e) => setBibleVersion(e.target.value as SermonInput["bibleVersion"])}
                className="min-h-[48px] rounded-2xl border border-card-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
              >
                {BIBLE_VERSION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">
                Observações adicionais <span className="font-normal text-muted">(opcional)</span>
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: quero abordar perdão, incluir uma aplicação para famílias..."
                maxLength={NOTES_MAX_LENGTH}
                rows={3}
                className="min-h-[80px] rounded-2xl border border-card-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-primary"
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
