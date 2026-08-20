"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAccountAction } from "./actions";

// Discreto de propósito (item pedido): sem cor de alarme, no fim da
// página, com um passo de confirmação antes de qualquer coisa
// acontecer — reduz clique acidental sem esconder o direito da pessoa
// de excluir a própria conta (LGPD).
export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  function handleConfirm() {
    setErrorMessage(null);
    startDeleting(async () => {
      const result = await deleteAccountAction();
      if (result.status === "error") {
        setErrorMessage(result.message);
        return;
      }
      router.push("/");
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-card-border bg-card p-4">
        <p className="text-sm text-foreground">
          Tem certeza? Sua conta, Biblioteca, favoritos e progresso na Academia serão
          apagados para sempre — isso não pode ser desfeito.
        </p>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isDeleting}
            className="flex min-h-[40px] flex-1 items-center justify-center rounded-xl border border-card-border text-sm font-medium text-foreground disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex min-h-[40px] flex-1 items-center justify-center rounded-xl border border-red-300 text-sm font-medium text-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Excluindo..." : "Sim, excluir minha conta"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-center text-sm text-muted underline underline-offset-4"
    >
      Excluir minha conta
    </button>
  );
}
