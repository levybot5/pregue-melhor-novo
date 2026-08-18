import { readFileSync } from "node:fs";
import { join } from "node:path";

// Ícone oficial (public/brand/icon-source.png, 1254x1254) embutido como
// data URI — é assim que o ImageResponse (Satori) consegue usar uma
// imagem local nos arquivos especiais de ícone (icon.tsx, apple-icon.tsx,
// icon-192/icon-512), que não podem simplesmente referenciar um <img
// src="/..."> normal.
let cachedDataUri: string | null = null;

export function getIconDataUri(): string {
  if (cachedDataUri) return cachedDataUri;
  const buffer = readFileSync(join(process.cwd(), "public/brand/icon-source.png"));
  cachedDataUri = `data:image/png;base64,${buffer.toString("base64")}`;
  return cachedDataUri;
}
