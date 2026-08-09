"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type CadastrarState } from "./actions";

const initialState: CadastrarState = { error: null, checkEmail: false };

export default function CadastrarPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Criar conta
        </h1>
        <p className="text-muted">Leva menos de um minuto.</p>
      </header>

      {state.checkEmail ? (
        <div className="rounded-2xl border border-card-border bg-card p-4 text-foreground">
          Verifique seu e-mail para confirmar o cadastro antes de entrar.
        </div>
      ) : (
        <>
          <form action={formAction} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Nome</span>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">E-mail</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Senha</span>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
              />
            </label>

            {state.error && <p className="text-red-600">{state.error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isPending ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-sm text-muted">
            Já tem conta?{" "}
            <Link
              href="/entrar"
              className="font-medium text-primary underline underline-offset-4"
            >
              Entrar
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
