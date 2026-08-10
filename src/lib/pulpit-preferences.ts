"use client";

// Preferências do Modo Púlpito — só localStorage, nunca vão ao banco
// (são do dispositivo, não da conta).
export type PulpitFontSize = "normal" | "grande" | "extra";
export type PulpitTheme = "claro" | "escuro";

const FONT_SIZE_KEY = "pregue-melhor:pulpit-font-size";
const THEME_KEY = "pregue-melhor:pulpit-theme";

const FONT_SIZES: readonly PulpitFontSize[] = ["normal", "grande", "extra"];

function readStorage<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  return (allowed as readonly string[]).includes(value ?? "") ? (value as T) : fallback;
}

export function getStoredFontSize(): PulpitFontSize {
  return readStorage(FONT_SIZE_KEY, FONT_SIZES, "normal");
}

export function setStoredFontSize(size: PulpitFontSize): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FONT_SIZE_KEY, size);
}

export function getStoredTheme(): PulpitTheme {
  return readStorage(THEME_KEY, ["claro", "escuro"] as const, "claro");
}

export function setStoredTheme(theme: PulpitTheme): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function nextFontSize(current: PulpitFontSize, direction: 1 | -1): PulpitFontSize {
  const index = FONT_SIZES.indexOf(current);
  const nextIndex = Math.min(FONT_SIZES.length - 1, Math.max(0, index + direction));
  return FONT_SIZES[nextIndex];
}
