"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { SearchIcon, PencilIcon, TrashIcon, SpinnerIcon, OpenBookIcon } from "@/components/icons";
import { createNoteAction, deleteNoteAction } from "./actions";
import { deleteNoteAction as deleteVerseNoteAction } from "../biblia-completa/actions";
import type { UnifiedNoteItem } from "./types";

type NotesListClientProps = {
  initialItems: UnifiedNoteItem[];
};

// O que está pendente de confirmação — guarda o suficiente pra excluir
// (id certo pra cada tipo) e pra mostrar o título na pergunta.
type PendingDelete =
  | { kind: "personal"; id: string; label: string }
  | { kind: "verse"; verseId: string; label: string };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function matchesQuery(item: UnifiedNoteItem, q: string): boolean {
  if (item.kind === "personal") {
    return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
  }
  return item.reference.toLowerCase().includes(q) || item.note.toLowerCase().includes(q);
}

export function NotesListClient({ initialItems }: NotesListClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => matchesQuery(item, q));
  }, [items, query]);

  function handleCreate() {
    setErrorMessage(null);
    startCreating(async () => {
      const result = await createNoteAction();
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      router.push(`/anotacoes/${result.id}`);
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    startDeleting(async () => {
      const result =
        target.kind === "personal"
          ? await deleteNoteAction(target.id)
          : await deleteVerseNoteAction(target.verseId);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setItems((current) =>
        current.filter((item) =>
          target.kind === "personal"
            ? !(item.kind === "personal" && item.id === target.id)
            : !(item.kind === "verse" && item.verseId === target.verseId),
        ),
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou conteúdo..."
            className="min-h-[48px] w-full rounded-2xl border border-card-border bg-card pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isCreating ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <PencilIcon className="h-4 w-4" />}
          Nova anotação
        </button>
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-card-border bg-card p-6 text-center text-sm text-muted">
          Nenhuma anotação ainda. Toque em &quot;Nova anotação&quot; para guardar sua primeira ideia,
          ou anote direto num versículo na Bíblia Guiada.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted">Nada encontrado para &quot;{query}&quot;.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) =>
            item.kind === "personal" ? (
              <li key={`personal-${item.id}`} className="relative">
                <Link
                  href={`/anotacoes/${item.id}`}
                  className="flex flex-col gap-1 rounded-2xl border border-card-border bg-card p-4 pr-12 transition-colors active:bg-card-active"
                >
                  <span className="font-semibold text-foreground">
                    {item.title.trim() || "Sem título"}
                  </span>
                  {item.content.trim() && (
                    <span className="line-clamp-2 text-sm text-muted">{item.content}</span>
                  )}
                  <span className="text-xs text-muted">Atualizado em {formatDate(item.updatedAt)}</span>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setPendingDelete({
                      kind: "personal",
                      id: item.id,
                      label: item.title.trim() || "Sem título",
                    })
                  }
                  aria-label="Excluir anotação"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-card-active"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ) : (
              <li key={`verse-${item.verseId}`} className="relative">
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 rounded-2xl border border-card-border bg-card-active p-4 pr-12 transition-colors active:bg-card"
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-accent">
                    <OpenBookIcon className="h-3.5 w-3.5" />
                    {item.reference}
                  </span>
                  <span className="line-clamp-2 text-sm italic text-muted">{item.note}</span>
                  <span className="text-xs text-muted">Atualizado em {formatDate(item.updatedAt)}</span>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setPendingDelete({ kind: "verse", verseId: item.verseId, label: item.reference })
                  }
                  aria-label="Excluir anotação"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-card-active"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ),
          )}
        </ul>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-card-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Excluir anotação</h2>
            <p className="mt-2 text-sm text-muted">
              Excluir &quot;{pendingDelete.label}&quot;? Essa ação não pode ser desfeita.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-card-border font-medium text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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
