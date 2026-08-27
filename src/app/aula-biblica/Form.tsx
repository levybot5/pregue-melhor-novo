"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { AulaBiblicaContent, AulaBiblicaInput } from "@/services/ai";
import { AulaBiblicaView } from "@/components/AulaBiblicaView";
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
import { generateAndSaveAulaBiblica, saveAulaBiblica, type AulaBiblicaActionResult } from "./actions";
import { TEMA_MAX_LENGTH, TEMA_MIN_LENGTH, OBJETIVO_MAX_LENGTH, NOTES_MAX_LENGTH } from "./constants";

const TEMA_SUGGESTIONS = ["O Filho Pródigo", "Os Frutos do Espírito", "Davi e Golias", "Os Dez Mandamentos"];

const AMBIENTE_OPTIONS: { value: AulaBiblicaInput["ambiente"]; label: string }[] = [
  { value: "escola_biblica", label: "Escola Bíblica" },
  { value: "celula", label: "Célula / Pequeno Grupo" },
  { value: "discipulado", label: "Discipulado" },
  { value: "outro", label: "Outro" },
];

const PUBLICO_OPTIONS: { value: AulaBiblicaInput["publico"]; label: string }[] = [
  { value: "criancas", label: "Crianças" },
  { value: "adolescentes", label: "Adolescentes" },
  { value: "jovens", label: "Jovens" },
  { value: "adultos", label: "Adultos" },
  { value: "geral", label: "Público geral" },
];

const DURACAO_OPTIONS: { value: AulaBiblicaInput["duracao"]; label: string }[] = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
];

const PROFUNDIDADE_OPTIONS: { value: AulaBiblicaInput["profundidade"]; label: string }[] = [
  { value: "basica", label: "Básica" },
  { value: "intermediaria", label: "Intermediária" },
  { value: "aprofundada", label: "Aprofundada" },
];

const BIBLE_VERSION_OPTIONS: { value: AulaBiblicaInput["bibleVersion"]; label: string }[] = [
  { value: "padrao", label: "Padrão (recomendado)" },
  { value: "ara", label: "Almeida Revista e Atualizada (ARA)" },
  { value: "arc", label: "Almeida Revista e Corrigida (ARC)" },
  { value: "naa", label: "Nova Almeida Atualizada (NAA)" },
  { value: "nvi", label: "Nova Versão Internacional (NVI)" },
  { value: "ntlh", label: "Nova Tradução na Linguagem de Hoje (NTLH)" },
  { value: "acf", label: "Almeida Corrigida Fiel (ACF)" },
];

type AulaBiblicaFormProps = {
  mode: "subscriber" | "trial" | "expired";
  initialRemaining: number;
};

export function AulaBiblicaForm({ mode, initialRemaining }: AulaBiblicaFormProps) {
  const isTrial = mode === "trial";
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [tema, setTema] = useState("");
  const [ambiente, setAmbiente] = useState<AulaBiblicaInput["ambiente"]>("escola_biblica");
  const [publico, setPublico] = useState<AulaBiblicaInput["publico"]>("adultos");
  const [duracao, setDuracao] = useState<AulaBiblicaInput["duracao"]>("45");
  const [profundidade, setProfundidade] = useState<AulaBiblicaInput["profundidade"]>("intermediaria");
  const [bibleVersion, setBibleVersion] = useState<AulaBiblicaInput["bibleVersion"]>("padrao");
  const [objetivo, setObjetivo] = useState("");
  const [notes, setNotes] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const [remaining, setRemaining] = useState(initialRemaining);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [pendingAula, setPendingAula] = useState<AulaBiblicaContent | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  useEffect(() => {
    if (pendingAula || trialExhausted || subscriptionExpired || limitNotice) {
      window.scrollTo({ top: 0 });
    }
  }, [pendingAula, trialExhausted, subscriptionExpired, limitNotice]);

  function handleResult(result: AulaBiblicaActionResult) {
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
      setPendingAula(result.aula);
      setSavedContentId(result.contentId);
      setSaveWarning(null);
      return;
    }
    if (result.status === "generated_not_saved") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingAula(result.aula);
      setSavedContentId(null);
      setSaveWarning(result.message);
      return;
    }
    if (result.status === "generated") {
      setRemaining((r) => Math.max(0, r - 1));
      setPendingAula(result.aula);
      setSavedContentId(null);
      setSaveWarning(null);
      return;
    }
    setErrorMessage(result.message);
  }

  function handleNewAula() {
    setPendingAula(null);
    setSavedContentId(null);
    setSaveWarning(null);
  }

  function handleGenerate() {
    setErrorMessage(null);
    setSaveWarning(null);
    startGenerating(async () => {
      const result = await generateAndSaveAulaBiblica({
        tema,
        ambiente,
        publico,
        duracao,
        profundidade,
        bibleVersion,
        objetivo,
        notes,
      });
      handleResult(result);
    });
  }

  function handleRetrySave() {
    if (!pendingAula) return;
    startSaving(async () => {
      const result = await saveAulaBiblica(pendingAula);
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

  if (pendingAula) {
    return (
      <>
        <AppHeader backHref="/" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
        <ReadingHeader title={pendingAula.titulo} />

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

        <AulaBiblicaView aula={pendingAula} />

        <ContentToolbar contentType="aula_biblica" content={pendingAula} title={pendingAula.titulo} />

        <button
          type="button"
          onClick={handleNewAula}
          className="flex min-h-[52px] items-center justify-center rounded-2xl border border-card-border bg-card px-5 font-semibold text-foreground"
        >
          Gerar outra aula
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
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Criar Aula Bíblica</h1>
          <p className="text-muted">Prepare aulas para EBD, células e pequenos grupos.</p>
        </div>
        {isTrial && <TrialSubscribeButton />}
      </header>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Tema ou passagem bíblica</span>
          <input
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ex.: O Filho Pródigo ou Lucas 15:11-32"
            minLength={TEMA_MIN_LENGTH}
            maxLength={TEMA_MAX_LENGTH}
            className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            {TEMA_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setTema(suggestion)}
                className="min-h-[36px] rounded-full border border-card-border bg-card px-3 text-xs font-medium text-muted"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-foreground">Onde você vai ensinar?</legend>
          <div className="grid grid-cols-2 gap-2">
            {AMBIENTE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAmbiente(option.value)}
                className={`min-h-[48px] rounded-2xl border px-3 text-sm font-medium ${
                  ambiente === option.value
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
            {PUBLICO_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPublico(option.value)}
                className={`min-h-[48px] rounded-2xl border px-3 text-sm font-medium ${
                  publico === option.value
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
          <div className="grid grid-cols-4 gap-2">
            {DURACAO_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuracao(option.value)}
                className={`min-h-[48px] rounded-2xl border px-1 text-sm font-medium ${
                  duracao === option.value
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
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">
                Objetivo específico da aula <span className="font-normal text-muted">(opcional)</span>
              </span>
              <input
                type="text"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Ex.: mostrar que o perdão de Deus não tem limites"
                maxLength={OBJETIVO_MAX_LENGTH}
                className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
              />
            </label>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-semibold text-foreground">Nível de profundidade</legend>
              <div className="grid grid-cols-3 gap-2">
                {PROFUNDIDADE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setProfundidade(option.value)}
                    className={`min-h-[48px] rounded-2xl border px-2 text-sm font-medium ${
                      profundidade === option.value
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
                onChange={(e) => setBibleVersion(e.target.value as AulaBiblicaInput["bibleVersion"])}
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
                placeholder="Ex.: turma tem alunos novos na fé, focar em linguagem bem simples..."
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
          disabled={isGenerating || remaining <= 0 || tema.trim().length < TEMA_MIN_LENGTH}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isGenerating && <SpinnerIcon className="h-5 w-5 animate-spin" />}
          {isGenerating ? "Gerando..." : "Criar Aula"}
        </button>
        {isGenerating && (
          <p role="status" className="text-center text-sm text-muted">
            Preparando sua aula... isso pode levar até 30 segundos.
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
