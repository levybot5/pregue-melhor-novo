"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Content } from "@/services/database";
import { getContentTypeLabel } from "@/lib/content-types";
import { TrashIcon } from "@/components/icons";
import { deleteContentAction } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Card inteiro continua clicável (leva ao detalhe) — o botão de
// excluir fica sobreposto num canto, com preventDefault/stopPropagation
// pra não disparar a navegação do Link. Mesmo padrão de confirmação em
// dois passos já usado no ContentToolbar (biblioteca/[id]).
export function BibliotecaListItem({ item }: { item: Content }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);
    setConfirming(true);
  }

  function confirmDelete() {
    setConfirming(false);
    startDeleting(async () => {
      const result = await deleteContentAction(item.id);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <Link
        href={`/biblioteca/${item.id}`}
        className="flex flex-col gap-1 rounded-2xl border border-card-border bg-card p-4 pr-14 shadow-sm transition-colors active:bg-card-active"
      >
        <span className="text-base font-semibold text-foreground">{item.title}</span>
        <span className="text-sm text-muted">
          {getContentTypeLabel(item.type)}
          {item.base_text ? ` · ${item.base_text}` : ""}
        </span>
        <span className="text-xs text-muted">{formatDate(item.created_at)}</span>
      </Link>

      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        aria-label={`Excluir "${item.title}"`}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-active hover:text-red-600 disabled:opacity-50"
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      {errorMessage && <p className="mt-1 px-1 text-sm text-red-600">{errorMessage}</p>}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-card-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Excluir conteúdo</h2>
            <p className="mt-2 text-sm text-muted">
              Excluir &ldquo;{item.title}&rdquo;? Essa ação não pode ser desfeita.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
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
    </div>
  );
}
