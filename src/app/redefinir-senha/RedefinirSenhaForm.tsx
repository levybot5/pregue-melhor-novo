"use client";

import { useActionState, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { updatePasswordAction, type RedefinirSenhaState } from "./actions";

const initialState: RedefinirSenhaState = { error: null };

export function RedefinirSenhaForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const confirmError =
    confirmPassword.length > 0 && confirmPassword !== password
      ? "As senhas não coincidem."
      : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordInput
        name="password"
        label="Nova senha"
        autoComplete="new-password"
        minLength={6}
        value={password}
        onChange={setPassword}
      />

      <PasswordInput
        name="confirmPassword"
        label="Confirme a nova senha"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={confirmError}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
