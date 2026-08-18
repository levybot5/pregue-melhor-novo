"use client";

import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type PasswordInputProps = {
  name: string;
  label: string;
  autoComplete: "new-password" | "current-password";
  minLength?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  // Só as telas de cadastro pedem pra começar visível (mais fácil de
  // conferir o que digitou ao criar a senha) — login e redefinição
  // continuam mascarados por padrão, como sempre foram.
  defaultVisible?: boolean;
};

// Campo de senha com alternância mostrar/ocultar por ícone de olho —
// reutilizado em cadastro, login e redefinição de senha para manter o
// mesmo comportamento nos três lugares.
//
// O botão de alternância fica FORA do <label> (associado ao input via
// htmlFor/id) de propósito: um <button> aninhado dentro de <label>
// recebe um segundo clique sintético que o próprio navegador dispara
// no controle associado ao label, cancelando a alternância de estado.
export function PasswordInput({
  name,
  label,
  autoComplete,
  minLength,
  value,
  onChange,
  error,
  defaultVisible = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(defaultVisible);
  const inputId = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          name={name}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[52px] w-full rounded-2xl border border-card-border bg-card px-4 pr-14 text-base text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted"
        >
          {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
