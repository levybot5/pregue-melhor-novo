"use client";

import { useState, useSyncExternalStore } from "react";

// Bumpar essa string a cada atualização que mereça avisar de novo —
// só isso já faz o popup voltar a aparecer pra quem já viu a anterior
// (guardado por chave, não por "já viu algum popup alguma vez").
const UPDATE_KEY = "update-seen-2026-09-30-esbocos-prontos";

// Mesmo padrão de InstallPwaBanner: leitura de localStorage via
// useSyncExternalStore, não setState em efeito — servidor sempre
// "já visto" (nunca mostra no SSR, sem flash nem mismatch de
// hidratação); só o client, depois de montar, pode saber o real.
function noopSubscribe() {
  return () => {};
}

function getSeenSnapshot(): boolean {
  try {
    return localStorage.getItem(UPDATE_KEY) === "1";
  } catch {
    return true;
  }
}

function getServerSeenSnapshot(): boolean {
  return true;
}

export function UpdateAnnouncementModal() {
  const seen = useSyncExternalStore(noopSubscribe, getSeenSnapshot, getServerSeenSnapshot);
  const [dismissed, setDismissed] = useState(false);

  const visible = !seen && !dismissed;

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(UPDATE_KEY, "1");
    } catch {
      // sem problema não persistir — só volta a aparecer na próxima visita.
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 sm:items-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-card-border bg-card p-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            Atualização
          </span>
          <h2 className="text-lg font-bold text-foreground">Se liga no que chegou 👀</h2>
        </div>

        <ul className="flex flex-col gap-3 text-sm text-foreground">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5">📖</span>
            <span>
              <strong>Nova tradução na Bíblia Guiada</strong> — agora dá pra ler em Bíblia Livre,
              uma linguagem mais simples, ao lado do Almeida Corrigida Fiel de sempre.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5">📚</span>
            <span>
              <strong>Versículos de apoio na Pregação Completa</strong> — cada ponto da mensagem
              agora traz referências cruzadas reais, não só o texto base.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5">🗣️</span>
            <span>
              <strong>Bíblia Viva como opção de linguagem</strong> — escolha esse estilo mais
              coloquial ao gerar pregação, aula bíblica ou comentário.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5">📂</span>
            <span>
              <strong>+50 esboços prontos na Biblioteca</strong> — mais opções de fé, família,
              oração, jovens, datas especiais e muito mais.
            </span>
          </li>
        </ul>

        <button
          type="button"
          onClick={handleDismiss}
          className="flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
