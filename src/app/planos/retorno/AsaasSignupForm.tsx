"use client";

import { useActionState, useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { signUpAndClaimAction, type AsaasSignupState } from "./actions";

const initialState: AsaasSignupState = { error: null, checkEmail: false };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AsaasSignupForm({ purchaseId }: { purchaseId: string }) {
  const boundAction = signUpAndClaimAction.bind(null, purchaseId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const emailError =
    emailTouched && email.length > 0 && !isValidEmail(email) ? "Digite um e-mail válido." : null;
  const passwordError =
    password.length > 0 && password.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : null;
  const confirmError =
    confirmPassword.length > 0 && confirmPassword !== password ? "As senhas não coincidem." : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setFormError(null);
    if (!isValidEmail(email)) {
      event.preventDefault();
      setEmailTouched(true);
      setFormError("Digite um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      event.preventDefault();
      setFormError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      event.preventDefault();
      setFormError("As senhas não coincidem.");
    }
  }

  if (state.checkEmail) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-4 text-center text-foreground">
        Verifique seu e-mail para confirmar o cadastro. Depois, entre normalmente — seu pagamento
        já está confirmado e será vinculado à sua conta.
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Nome</span>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Digite seu e-mail</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
        />
        {emailError && <span className="text-sm text-red-600">{emailError}</span>}
      </label>

      <PasswordInput
        name="password"
        label="Crie sua senha"
        autoComplete="new-password"
        minLength={6}
        value={password}
        onChange={setPassword}
        error={passwordError}
        defaultVisible
      />

      <PasswordInput
        name="confirmPassword"
        label="Confirme sua senha"
        autoComplete="new-password"
        defaultVisible
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={confirmError}
      />

      {(formError || state.error) && (
        <p className="text-sm text-red-600">{formError ?? state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Criando..." : "Criar meu acesso"}
      </button>
    </form>
  );
}
