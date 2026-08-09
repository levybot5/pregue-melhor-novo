"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createTestContent } from "./actions";

export default function PregacaoPage() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleCreateTestContent() {
    setFeedback(null);
    startTransition(async () => {
      const result = await createTestContent();
      setFeedback(
        result.success
          ? { type: "success", message: "Conteúdo salvo com sucesso." }
          : { type: "error", message: result.message },
      );
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pregação Completa
        </h1>
        <p className="text-muted">Teste de persistência</p>
      </header>

      <button
        type="button"
        onClick={handleCreateTestContent}
        disabled={isPending}
        className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Criar conteúdo de teste"}
      </button>

      {feedback && (
        <p
          role="status"
          className={
            feedback.type === "success" ? "text-primary" : "text-red-600"
          }
        >
          {feedback.message}
        </p>
      )}

      <Link
        href="/biblioteca"
        className="text-sm font-medium text-primary underline underline-offset-4"
      >
        Ver Minha Biblioteca
      </Link>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
