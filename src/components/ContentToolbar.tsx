"use client";

import { useState } from "react";
import type {
  SermonContent,
  BibleStudyContent,
  OutlineExpansionContent,
  PulpitOutlineContent,
} from "@/services/ai";
import type { ReadySermon, ReadyOutline, FavoriteContentType } from "@/services/database";
import type { PulpitModeContent } from "@/lib/pulpit-mode";
import { PulpitMode } from "./PulpitMode";
import { FavoriteButton } from "./FavoriteButton";

export type ContentToolbarProps = (
  | { contentType: "pregacao"; content: SermonContent; title: string }
  | { contentType: "biblia_explicada"; content: BibleStudyContent; title: string }
  | { contentType: "esboco_pregacao"; content: OutlineExpansionContent; title: string }
  | { contentType: "esboco_pulpito"; content: PulpitOutlineContent; title: string }
  | { contentType: "pregacao_pronta"; content: ReadySermon; title: string }
  | { contentType: "esboco_pronto"; content: ReadyOutline; title: string }
) & {
  // Só presente no acervo editorial (Pregações/Esboços Prontos) — a
  // Biblioteca pessoal não tem favoritos.
  favorite?: { contentType: FavoriteContentType; contentId: string; initialFavorited: boolean };
};

// Todas as bibliotecas pesadas (react-pdf, os templates de PDF e o
// mapeador do Modo Púlpito) só entram no bundle quando o usuário clica
// em um destes botões — import() dinâmico, nunca no topo do arquivo.
// Tudo aqui parte de conteúdo JÁ SALVO recebido via props: 0 chamadas
// de IA em qualquer uma destas ações.

async function buildPulpitModeContent(props: ContentToolbarProps): Promise<PulpitModeContent> {
  const {
    sermonToPulpitMode,
    outlineExpansionToPulpitMode,
    pulpitOutlineToPulpitMode,
    readySermonToPulpitMode,
    readyOutlineToPulpitMode,
  } = await import("@/lib/pulpit-mode");

  if (props.contentType === "pregacao") return sermonToPulpitMode(props.content);
  if (props.contentType === "esboco_pregacao") return outlineExpansionToPulpitMode(props.content);
  if (props.contentType === "esboco_pulpito") return pulpitOutlineToPulpitMode(props.content);
  if (props.contentType === "pregacao_pronta") return readySermonToPulpitMode(props.content);
  if (props.contentType === "esboco_pronto") return readyOutlineToPulpitMode(props.content);
  throw new Error("Modo Púlpito não está disponível para este tipo de conteúdo.");
}

async function buildPdfBlob(props: ContentToolbarProps): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");

  if (props.contentType === "pregacao") {
    const { SermonPdfDocument, sermonToPdfData } = await import("@/lib/pdf/sermon-pdf");
    return pdf(<SermonPdfDocument data={sermonToPdfData(props.content)} />).toBlob();
  }
  if (props.contentType === "esboco_pregacao") {
    const { SermonPdfDocument, outlineExpansionToPdfData } = await import("@/lib/pdf/sermon-pdf");
    return pdf(<SermonPdfDocument data={outlineExpansionToPdfData(props.content)} />).toBlob();
  }
  if (props.contentType === "biblia_explicada") {
    const { BibleStudyPdfDocument } = await import("@/lib/pdf/bible-study-pdf");
    return pdf(<BibleStudyPdfDocument study={props.content} />).toBlob();
  }
  if (props.contentType === "esboco_pulpito") {
    const { PulpitOutlinePdfDocument } = await import("@/lib/pdf/pulpit-outline-pdf");
    return pdf(<PulpitOutlinePdfDocument outline={props.content} />).toBlob();
  }
  if (props.contentType === "pregacao_pronta") {
    const { ReadySermonPdfDocument } = await import("@/lib/pdf/ready-sermon-pdf");
    return pdf(<ReadySermonPdfDocument sermon={props.content} />).toBlob();
  }
  const { ReadyOutlinePdfDocument } = await import("@/lib/pdf/ready-outline-pdf");
  return pdf(<ReadyOutlinePdfDocument outline={props.content} />).toBlob();
}

async function buildCopyText(props: ContentToolbarProps): Promise<string> {
  const {
    formatSermonForCopy,
    formatBibleStudyForCopy,
    formatOutlineExpansionForCopy,
    formatPulpitOutlineForCopy,
    formatReadySermonForCopy,
    formatReadyOutlineForCopy,
  } = await import("@/lib/copy-content");

  if (props.contentType === "pregacao") return formatSermonForCopy(props.content);
  if (props.contentType === "biblia_explicada") return formatBibleStudyForCopy(props.content);
  if (props.contentType === "esboco_pregacao") return formatOutlineExpansionForCopy(props.content);
  if (props.contentType === "esboco_pulpito") return formatPulpitOutlineForCopy(props.content);
  if (props.contentType === "pregacao_pronta") return formatReadySermonForCopy(props.content);
  return formatReadyOutlineForCopy(props.content);
}

const DIACRITIC_MARKS = /[̀-ͯ]/g;

function sanitizeFileName(title: string): string {
  return (
    title
      .normalize("NFD")
      .replace(DIACRITIC_MARKS, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "conteudo"
  );
}

const TOOLBAR_BUTTON_CLASS =
  "flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-card-border bg-card px-3 text-sm font-semibold text-foreground disabled:opacity-60";

export function ContentToolbar(props: ContentToolbarProps) {
  const [pulpitContent, setPulpitContent] = useState<PulpitModeContent | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const showPulpitMode = props.contentType !== "biblia_explicada";

  async function handlePulpitMode() {
    setPulpitContent(await buildPulpitModeContent(props));
  }

  async function handleDownloadPdf() {
    setPdfLoading(true);
    try {
      const blob = await buildPdfBlob(props);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFileName(props.title)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleCopy() {
    try {
      const text = await buildCopyText(props);
      await navigator.clipboard.writeText(text);
      setCopyLabel("Copiado!");
    } catch {
      setCopyLabel("Erro ao copiar");
    } finally {
      setTimeout(() => setCopyLabel("Copiar"), 2000);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        {showPulpitMode && (
          <button type="button" onClick={handlePulpitMode} className={TOOLBAR_BUTTON_CLASS}>
            Modo Púlpito
          </button>
        )}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          className={TOOLBAR_BUTTON_CLASS}
        >
          {pdfLoading ? "Gerando..." : "Baixar PDF"}
        </button>
        <button type="button" onClick={handleCopy} className={TOOLBAR_BUTTON_CLASS}>
          {copyLabel}
        </button>
        {props.favorite && (
          <FavoriteButton
            contentType={props.favorite.contentType}
            contentId={props.favorite.contentId}
            initialFavorited={props.favorite.initialFavorited}
            className={TOOLBAR_BUTTON_CLASS}
          />
        )}
      </div>

      {pulpitContent && (
        <PulpitMode content={pulpitContent} onClose={() => setPulpitContent(null)} />
      )}
    </>
  );
}
