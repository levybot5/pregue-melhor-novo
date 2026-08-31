"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { signInAction, type EntrarState } from "./actions";

const initialState: EntrarState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "";

  // Controlados os dois — sem isso, o e-mail (ao contrário da senha)
  // ficava em branco depois de um erro de login, porque o <form
  // action={...}> do React reseta campos não controlados quando a
  // Server Action termina, mesmo em caso de erro.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
          />
        </label>

        <PasswordInput
          name="password"
          label="Senha"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <Link
        href="/esqueci-senha"
        className="text-center text-sm font-medium text-muted underline underline-offset-4"
      >
        Esqueci minha senha
      </Link>

      <p className="text-center text-sm text-muted">
        Ainda não tenho conta{" "}
        <Link
          href="/cadastrar"
          className="font-medium text-primary underline underline-offset-4"
        >
          Cadastrar
        </Link>
      </p>
    </>
  );
}
