"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  SermonContent,
  BibleStudyContent,
  OutlineExpansionContent,
  PulpitOutlineContent,
  SermonOutlineContent,
  DevotionalContent,
  AulaBiblicaContent,
} from "@/services/ai";
import type { ReadySermon, ReadyOutline, FavoriteContentType } from "@/services/database";
import type { PulpitModeContent } from "@/lib/pulpit-mode";
import { PulpitMode } from "./PulpitMode";
import { FavoriteButton } from "./FavoriteButton";
import { PodiumIcon, PdfIcon, CopyIcon, TrashIcon } from "./icons";
import { deleteContentAction } from "@/app/biblioteca/actions";

// Aula Bíblica: ensino/classe, não ministração de púlpito — mesmo
// grupo de biblia_explicada/devocional (formato que Modo Púlpito não
// serve).
const NO_PULPIT_MODE_TYPES = new Set(["biblia_explicada", "devocional", "aula_biblica"]);

export type ContentToolbarProps = (
  | { contentType: "pregacao"; content: SermonContent; title: string }
  | { contentType: "biblia_explicada"; content: BibleStudyContent; title: string }
  | { contentType: "esboco_pregacao"; content: OutlineExpansionContent; title: string }
  | { contentType: "esboco_pulpito"; content: SermonOutlineContent; title: string }
  // Conteúdo salvo no formato antigo desta ferramenta (antes de virar
  // "Pregação para Esboço"), só para continuar abrindo normalmente.
  | { contentType: "esboco_pulpito_legacy"; content: PulpitOutlineContent; title: string }
  | { contentType: "pregacao_pronta"; content: ReadySermon; title: string }
  | { contentType: "esboco_pronto"; content: ReadyOutline; title: string }
  | { contentType: "devocional"; content: DevotionalContent; title: string }
  | { contentType: "aula_biblica"; content: AulaBiblicaContent; title: string }
) & {
  // Só presente no acervo editorial (Pregações/Esboços Prontos) — a
  // Biblioteca pessoal não tem favoritos.
  favorite?: { contentType: FavoriteContentType; contentId: string; initialFavorited: boolean };
  // Só presente na Biblioteca pessoal (conteúdo salvo em `contents`,
  // que o usuário realmente pode apagar) — nunca no acervo editorial
  // (Pregações/Esboços Prontos), que não pertence a ele.
  deletable?: { contentId: string };
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
    sermonOutlineToPulpitMode,
    pulpitOutlineToPulpitMode,
    readySermonToPulpitMode,
    readyOutlineToPulpitMode,
  } = await import("@/lib/pulpit-mode");

  if (props.contentType === "pregacao") return sermonToPulpitMode(props.content);
  if (props.contentType === "esboco_pregacao") return outlineExpansionToPulpitMode(props.content);
  if (props.contentType === "esboco_pulpito") return sermonOutlineToPulpitMode(props.content);
  if (props.contentType === "esboco_pulpito_legacy") return pulpitOutlineToPulpitMode(props.content);
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
    const { SermonOutlinePdfDocument } = await import("@/lib/pdf/sermon-outline-pdf");
    return pdf(<SermonOutlinePdfDocument outline={props.content} />).toBlob();
  }
  if (props.contentType === "esboco_pulpito_legacy") {
    const { PulpitOutlinePdfDocument } = await import("@/lib/pdf/pulpit-outline-pdf");
    return pdf(<PulpitOutlinePdfDocument outline={props.content} />).toBlob();
  }
  if (props.contentType === "pregacao_pronta") {
    const { ReadySermonPdfDocument } = await import("@/lib/pdf/ready-sermon-pdf");
    return pdf(<ReadySermonPdfDocument sermon={props.content} />).toBlob();
  }
  if (props.contentType === "esboco_pronto") {
    const { ReadyOutlinePdfDocument } = await import("@/lib/pdf/ready-outline-pdf");
    return pdf(<ReadyOutlinePdfDocument outline={props.content} />).toBlob();
  }
  if (props.contentType === "aula_biblica") {
    const { AulaBiblicaPdfDocument } = await import("@/lib/pdf/aula-biblica-pdf");
    return pdf(<AulaBiblicaPdfDocument aula={props.content} />).toBlob();
  }
  const { DevotionalPdfDocument } = await import("@/lib/pdf/devotional-pdf");
  return pdf(<DevotionalPdfDocument devotional={props.content} />).toBlob();
}

// "Esboço para Púlpito" embutido na Pregação Completa / Esboço em
// Pregação, como PDF avulso — só esses dois tipos têm esse campo.
const OUTLINE_PDF_TYPES = new Set(["pregacao", "esboco_pregacao"]);

async function buildOutlinePdfBlob(props: ContentToolbarProps): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  const { SermonOutlineOnlyPdfDocument, sermonToPdfData, outlineExpansionToPdfData } = await import(
    "@/lib/pdf/sermon-pdf"
  );

  if (props.contentType === "pregacao") {
    return pdf(<SermonOutlineOnlyPdfDocument data={sermonToPdfData(props.content)} />).toBlob();
  }
  if (props.contentType === "esboco_pregacao") {
    return pdf(
      <SermonOutlineOnlyPdfDocument data={outlineExpansionToPdfData(props.content)} />,
    ).toBlob();
  }
  throw new Error("PDF de esboço não está disponível para este tipo de conteúdo.");
}

async function buildCopyText(props: ContentToolbarProps): Promise<string> {
  const {
    formatSermonForCopy,
    formatBibleStudyForCopy,
    formatOutlineExpansionForCopy,
    formatSermonOutlineForCopy,
    formatPulpitOutlineForCopy,
    formatReadySermonForCopy,
    formatReadyOutlineForCopy,
    formatDevotionalForCopy,
    formatAulaBiblicaForCopy,
  } = await import("@/lib/copy-content");

  if (props.contentType === "pregacao") return formatSermonForCopy(props.content);
  if (props.contentType === "biblia_explicada") return formatBibleStudyForCopy(props.content);
  if (props.contentType === "esboco_pregacao") return formatOutlineExpansionForCopy(props.content);
  if (props.contentType === "esboco_pulpito") return formatSermonOutlineForCopy(props.content);
  if (props.contentType === "esboco_pulpito_legacy") return formatPulpitOutlineForCopy(props.content);
  if (props.contentType === "pregacao_pronta") return formatReadySermonForCopy(props.content);
  if (props.contentType === "esboco_pronto") return formatReadyOutlineForCopy(props.content);
  if (props.contentType === "aula_biblica") return formatAulaBiblicaForCopy(props.content);
  return formatDevotionalForCopy(props.content);
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
  "flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border border-card-border bg-card px-3.5 text-sm font-medium text-primary disabled:opacity-60";

export function ContentToolbar(props: ContentToolbarProps) {
  const router = useRouter();
  const [pulpitContent, setPulpitContent] = useState<PulpitModeContent | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [outlinePdfLoading, setOutlinePdfLoading] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const showPulpitMode = !NO_PULPIT_MODE_TYPES.has(props.contentType);
  const showOutlinePdf = OUTLINE_PDF_TYPES.has(props.contentType);

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

  async function handleDownloadOutlinePdf() {
    setOutlinePdfLoading(true);
    try {
      const blob = await buildOutlinePdfBlob(props);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFileName(props.title)}-esboco.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setOutlinePdfLoading(false);
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

  function handleDelete() {
    if (!props.deletable) return;
    setDeleteError(null);
    setConfirmingDelete(true);
  }

  function confirmDelete() {
    if (!props.deletable) return;
    setConfirmingDelete(false);
    startDelete(async () => {
      const result = await deleteContentAction(props.deletable!.contentId);
      if (result.success) {
        router.push("/biblioteca");
        return;
      }
      setDeleteError(result.message);
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {showPulpitMode && (
          <button type="button" onClick={handlePulpitMode} className={TOOLBAR_BUTTON_CLASS}>
            <PodiumIcon className="h-4 w-4" />
            Púlpito
          </button>
        )}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          className={TOOLBAR_BUTTON_CLASS}
        >
          <PdfIcon className="h-4 w-4" />
          {pdfLoading ? "Gerando..." : "PDF"}
        </button>
        {showOutlinePdf && (
          <button
            type="button"
            onClick={handleDownloadOutlinePdf}
            disabled={outlinePdfLoading}
            className={TOOLBAR_BUTTON_CLASS}
          >
            <PdfIcon className="h-4 w-4" />
            {outlinePdfLoading ? "Gerando..." : "Esboço"}
          </button>
        )}
        <button type="button" onClick={handleCopy} className={TOOLBAR_BUTTON_CLASS}>
          <CopyIcon className="h-4 w-4" />
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

      {props.deletable && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 text-sm font-medium text-red-700 disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
        </div>
      )}

      {pulpitContent && (
        <PulpitMode content={pulpitContent} onClose={() => setPulpitContent(null)} />
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-card-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Excluir conteúdo</h2>
            <p className="mt-2 text-sm text-muted">
              Excluir &ldquo;{props.title}&rdquo;? Essa ação não pode ser desfeita.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex min-h-[44px] items-center justify-center rounded-full border border-card-border bg-card px-3.5 text-sm font-medium text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex min-h-[44px] items-center justify-center rounded-full bg-red-600 px-3.5 text-sm font-medium text-white"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
