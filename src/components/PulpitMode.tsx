"use client";

import { useState } from "react";
import type { PulpitModeContent } from "@/lib/pulpit-mode";
import {
  getStoredFontSize,
  getStoredTheme,
  nextFontSize,
  setStoredFontSize,
  setStoredTheme,
  type PulpitFontSize,
  type PulpitTheme,
} from "@/lib/pulpit-preferences";

type PulpitModeProps = {
  content: PulpitModeContent;
  onClose: () => void;
};

const SIZE_LABELS: Record<PulpitFontSize, string> = {
  normal: "Normal",
  grande: "Grande",
  extra: "Extra grande",
};

const SIZE_CLASSES: Record<PulpitFontSize, { heading: string; body: string; small: string }> = {
  normal: { heading: "text-2xl", body: "text-lg", small: "text-base" },
  grande: { heading: "text-3xl", body: "text-xl", small: "text-lg" },
  extra: { heading: "text-4xl", body: "text-2xl", small: "text-xl" },
};

// Visualização cheia de tela para usar durante a ministração. Usa
// SOMENTE o conteúdo já recebido via props (já salvo) — nada aqui
// chama IA, nem ao abrir, nem ao trocar fonte/tema.
export function PulpitMode({ content, onClose }: PulpitModeProps) {
  // Só é montado no cliente (aberto por clique), nunca durante SSR —
  // por isso é seguro ler localStorage direto no estado inicial, sem
  // precisar de useEffect (e sem risco de mismatch de hidratação).
  const [fontSize, setFontSize] = useState<PulpitFontSize>(getStoredFontSize);
  const [theme, setTheme] = useState<PulpitTheme>(getStoredTheme);

  function changeFontSize(direction: 1 | -1) {
    setFontSize((current) => {
      const next = nextFontSize(current, direction);
      setStoredFontSize(next);
      return next;
    });
  }

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "claro" ? "escuro" : "claro";
      setStoredTheme(next);
      return next;
    });
  }

  const sizes = SIZE_CLASSES[fontSize];
  const isDark = theme === "escuro";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${
        isDark ? "bg-neutral-950 text-neutral-50" : "bg-white text-neutral-900"
      }`}
    >
      <header
        className={`flex items-center justify-between gap-2 border-b px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] ${
          isDark ? "border-neutral-800" : "border-neutral-200"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar Modo Púlpito"
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl font-semibold ${
            isDark ? "bg-neutral-900" : "bg-neutral-100"
          }`}
        >
          ×
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeFontSize(-1)}
            aria-label="Diminuir fonte"
            disabled={fontSize === "normal"}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl font-bold disabled:opacity-40 ${
              isDark ? "bg-neutral-900" : "bg-neutral-100"
            }`}
          >
            A-
          </button>
          <span className={`w-20 text-center text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            {SIZE_LABELS[fontSize]}
          </span>
          <button
            type="button"
            onClick={() => changeFontSize(1)}
            aria-label="Aumentar fonte"
            disabled={fontSize === "extra"}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl font-bold disabled:opacity-40 ${
              isDark ? "bg-neutral-900" : "bg-neutral-100"
            }`}
          >
            A+
          </button>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-lg ${
            isDark ? "bg-neutral-900" : "bg-neutral-100"
          }`}
        >
          {isDark ? "☀" : "☾"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className={`${sizes.heading} font-bold leading-tight`}>{content.tema}</h1>
            <p className={`${sizes.small} ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              {content.textoBase} · {content.ideiaCentral}
            </p>
          </div>

          {content.introducao && (
            <p className={`${sizes.body} leading-relaxed`}>{content.introducao}</p>
          )}

          {content.pontos.map((ponto, index) => (
            <section key={index} className="flex flex-col gap-2">
              <h2 className={`${sizes.heading} font-bold`}>
                {index + 1}. {ponto.titulo}
              </h2>
              <ul className={`${sizes.body} ml-5 list-disc leading-relaxed`}>
                {ponto.itens.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
              {ponto.fraseImpacto && (
                <p
                  className={`${sizes.body} rounded-xl px-3 py-2 font-semibold ${
                    isDark ? "bg-neutral-900" : "bg-neutral-100"
                  }`}
                >
                  &ldquo;{ponto.fraseImpacto}&rdquo;
                </p>
              )}
            </section>
          ))}

          {content.aplicacao && content.aplicacao.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className={`${sizes.heading} font-bold`}>Aplicação</h2>
              {content.aplicacao.length === 1 ? (
                <p className={`${sizes.body} leading-relaxed`}>{content.aplicacao[0]}</p>
              ) : (
                <ul className={`${sizes.body} ml-5 list-disc leading-relaxed`}>
                  {content.aplicacao.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className={`flex flex-col gap-1 rounded-2xl px-4 py-3 ${isDark ? "bg-neutral-900" : "bg-neutral-100"}`}>
            <h2 className={`${sizes.small} font-semibold uppercase tracking-wide`}>Apelo</h2>
            <p className={`${sizes.body} font-medium leading-relaxed`}>{content.apelo}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
