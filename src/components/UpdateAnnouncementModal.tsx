"use client";

import { useState, useSyncExternalStore } from "react";

// Bumpar essa string a cada atualização que mereça avisar de novo —
// só isso já faz o popup voltar a aparecer pra quem já viu a anterior
// (guardado por chave, não por "já viu algum popup alguma vez").
const UPDATE_KEY = "update-seen-2026-09-19-indicacao-whatsapp-busca";

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
            <span className="mt-0.5">🎁</span>
            <span>
              <strong>Indique um amigo</strong> — chame outro pregador pelo WhatsApp e, quando
              ele assinar, vocês dois ganham 15 dias grátis de Pro. Ache seu link em Conta.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5">💬</span>
            <span>
              <strong>Compartilhar no WhatsApp</strong> — qualquer pregação, esboço ou
              devocional que você gerar já tem um botão pra mandar direto.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5">🔍</span>
            <span>
              <strong>Busca na Biblioteca</strong> — encontre suas mensagens salvas por título,
              tema ou passagem.
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
