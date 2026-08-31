"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PersonalNote } from "@/services/database";
import { TrashIcon } from "@/components/icons";
import { updateNoteAction, deleteNoteAction } from "../actions";
import { TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH } from "../constants";

type NoteEditorProps = {
  note: PersonalNote;
};

// Espera 900ms sem digitar antes de salvar — evita uma chamada por
// tecla, mas ainda parece "automático" pro usuário (bem menor que o
// tempo que alguém leva pra perceber e reagir a uma perda de conteúdo).
const AUTOSAVE_DELAY_MS = 900;

type SaveState = "idle" | "saving" | "saved" | "error";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [updatedAt, setUpdatedAt] = useState(note.updatedAt);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  // Não dispara autosave no primeiro render (nada mudou ainda) — só a
  // partir da primeira edição de verdade.
  const isFirstRender = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveState("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const result = await updateNoteAction(note.id, title, content);
      if (result.success) {
        setSaveState("saved");
        setUpdatedAt(new Date().toISOString());
      } else {
        setSaveState("error");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  function handleDelete() {
    setConfirmingDelete(false);
    startDeleting(async () => {
      const result = await deleteNoteAction(note.id);
      if (result.success) {
        router.push("/anotacoes");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
        placeholder="Título"
        className="rounded-2xl border border-card-border bg-card px-4 py-3 text-lg font-bold text-foreground outline-none focus:border-primary"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH))}
        placeholder="Escreva livremente: uma ideia de pregação, um versículo, um tema, um insight do estudo..."
        rows={16}
        className="min-h-[320px] flex-1 rounded-2xl border border-card-border bg-card px-4 py-3 text-base leading-relaxed text-foreground outline-none focus:border-primary"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {saveState === "saving" && "Salvando..."}
          {saveState === "saved" && `Salvo — atualizado em ${formatDateTime(updatedAt)}`}
          {saveState === "error" && "Não foi possível salvar. Verifique sua conexão."}
          {saveState === "idle" && `Criado em ${formatDateTime(note.createdAt)}`}
        </p>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Excluir anotação"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-card-active"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-card-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Excluir anotação</h2>
            <p className="mt-2 text-sm text-muted">
              Excluir &quot;{title.trim() || "Sem título"}&quot;? Essa ação não pode ser desfeita.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-card-border font-medium text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-red-600 font-semibold text-white disabled:opacity-60"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
