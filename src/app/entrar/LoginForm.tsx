"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signInAction, type EntrarState } from "./actions";

const initialState: EntrarState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "";

  return (
    <>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

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
            autoComplete="current-password"
            className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
          />
        </label>

        {state.error && <p className="text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-sm text-muted">
        Não tem conta?{" "}
        <Link
          href="/cadastrar"
          className="font-medium text-primary underline underline-offset-4"
        >
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
