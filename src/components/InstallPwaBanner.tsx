"use client";

import { useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

// Captura o evento nativo de instalação assim que o navegador dispara
// (uma vez só, fora de qualquer componente) e republica via
// useSyncExternalStore — sem setState em efeito, sem risco de
// mismatch de hidratação (o servidor nunca tem esse evento).
let capturedPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    capturedPrompt = event as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener());
  });
}

function subscribeToPrompt(callback: () => void) {
  promptListeners.add(callback);
  return () => promptListeners.delete(callback);
}

function getPromptSnapshot() {
  return capturedPrompt;
}

function getServerPromptSnapshot(): BeforeInstallPromptEvent | null {
  return null;
}

type EnvSnapshot = { standalone: boolean; ios: boolean; dismissed: boolean };

const SERVER_ENV_SNAPSHOT: EnvSnapshot = { standalone: true, ios: false, dismissed: true };
let cachedEnvSnapshot: EnvSnapshot | null = null;

// Valores que não mudam depois do carregamento — computados uma vez
// e cacheados, para o useSyncExternalStore não re-renderizar à toa.
function getEnvSnapshot(): EnvSnapshot {
  if (!cachedEnvSnapshot) {
    cachedEnvSnapshot = {
      standalone:
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true,
      ios: /iphone|ipad|ipod/i.test(navigator.userAgent),
      dismissed: localStorage.getItem(DISMISS_KEY) === "1",
    };
  }
  return cachedEnvSnapshot;
}

function noopSubscribe() {
  return () => {};
}

function getServerEnvSnapshot(): EnvSnapshot {
  return SERVER_ENV_SNAPSHOT;
}

// No Android/desktop, o navegador dispara beforeinstallprompt e a
// gente mostra um botão que aciona o prompt nativo de instalação. No
// iOS o Safari não expõe esse evento — mostra a instrução manual
// (Compartilhar > Adicionar à Tela de Início). Some sozinho se o app
// já estiver instalado, e fica escondido depois de fechado (guardado
// no localStorage).
export function InstallPwaBanner() {
  const deferredPrompt = useSyncExternalStore(
    subscribeToPrompt,
    getPromptSnapshot,
    getServerPromptSnapshot,
  );
  const env = useSyncExternalStore(noopSubscribe, getEnvSnapshot, getServerEnvSnapshot);
  const [manuallyDismissed, setManuallyDismissed] = useState(false);

  const showIosHint = env.ios && !env.standalone && !env.dismissed;
  const showInstallButton = Boolean(deferredPrompt) && !env.standalone && !env.dismissed;
  const visible = (showIosHint || showInstallButton) && !manuallyDismissed;

  function handleDismiss() {
    setManuallyDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    capturedPrompt = null;
    setManuallyDismissed(true);
  }

  if (!visible) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft/40 px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-primary">Instale o Pregue Melhor</span>
        {showIosHint ? (
          <span className="text-xs text-muted">
            Toque em <strong>Compartilhar</strong> e depois em{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </span>
        ) : (
          <span className="text-xs text-muted">
            Acesse mais rápido, direto da tela inicial do seu celular.
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!showIosHint && (
          <button
            type="button"
            onClick={handleInstall}
            className="min-h-[36px] rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground"
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar"
          className="flex min-h-[36px] min-w-[36px] items-center justify-center text-lg leading-none text-muted"
        >
          ×
        </button>
      </div>
    </div>
  );
}
