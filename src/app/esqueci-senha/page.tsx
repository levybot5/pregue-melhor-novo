"use client";

import { useActionState, useState } from "react";
import { AuthLogo } from "@/components/AuthLogo";
import { BackLink } from "@/components/reading";
import { requestPasswordResetAction, type EsqueciSenhaState } from "./actions";

const initialState: EsqueciSenhaState = { submitted: false, error: null };

export default function EsqueciSenhaPage() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  // Controlado — mesma correção do /entrar: sem isso, um erro apaga o
  // e-mail já digitado (o <form action={...}> reseta campo não
  // controlado quando a Server Action termina).
  const [email, setEmail] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/entrar" />
      <AuthLogo />

      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Esqueci minha senha
        </h1>
        <p className="text-muted">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </header>

      {state.submitted ? (
        <div className="rounded-2xl border border-card-border bg-card p-4 text-center text-foreground">
          Se esse e-mail tiver uma conta no Pregue Melhor, você vai receber um link para
          redefinir sua senha.
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">Digite seu e-mail</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
            />
          </label>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
          >
            {isPending ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      )}
    </main>
  );
}
