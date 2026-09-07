"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState, type FormEvent } from "react";
import { AuthLogo } from "@/components/AuthLogo";
import { PasswordInput } from "@/components/PasswordInput";
import { BackLink } from "@/components/reading";
import { signUpAction, type CadastrarState } from "./actions";

const initialState: CadastrarState = { error: null, checkEmail: false };

// Precisa bater exatamente com translateAuthError() em services/auth —
// esse erro específico ganha um aviso mais visível (achado real: gente
// que já assina tentava cadastrar de novo com o mesmo e-mail, via
// anúncio, e não percebia que precisava clicar em "Entrar" mais abaixo
// — ficava travada olhando só a mensagem de erro em texto).
const ALREADY_EXISTS_ERROR = "Já existe uma conta com este e-mail.";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CadastrarPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);
  const searchParams = useSearchParams();

  // proxy.ts manda pra cá com "redirectTo" (o caminho, ex.: /planos/pagar)
  // e os demais parâmetros originais soltos ao lado (ex.: plan=anual) —
  // sem reconstruir os dois juntos aqui, quem clicava num plano da oferta
  // sem estar logado criava a conta e caía na Home, perdendo a intenção
  // de compra (o próprio /entrar já faz essa reconstrução corretamente).
  const redirectPath = searchParams.get("redirectTo") || "/";
  const extraParams = new URLSearchParams(searchParams);
  extraParams.delete("redirectTo");
  const redirectTo = extraParams.size > 0 ? `${redirectPath}?${extraParams.toString()}` : redirectPath;
  const entrarHref = `/entrar?${new URLSearchParams({ redirectTo }).toString()}`;

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Mesmo link do "Entrar" acima, mas levando o e-mail já digitado —
  // usado só no aviso de "já existe conta" (ALREADY_EXISTS_ERROR
  // abaixo), pra quem já é assinante não precisar redigitar o e-mail.
  const entrarComEmailHref = `/entrar?${new URLSearchParams({ redirectTo, email }).toString()}`;

  const emailError =
    emailTouched && email.length > 0 && !isValidEmail(email)
      ? "Digite um e-mail válido."
      : null;
  const passwordError =
    password.length > 0 && password.length < 6
      ? "A senha precisa ter pelo menos 6 caracteres."
      : null;

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
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)] lg:max-w-md lg:justify-center lg:rounded-3xl lg:border lg:border-card-border lg:bg-card lg:p-10 lg:pt-10 lg:shadow-xl">
      <BackLink href="/" />
      <AuthLogo />

      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Crie seu acesso
        </h1>
        <p className="text-muted">Cadastre-se para acessar o Pregue Melhor.</p>
      </header>

      {state.checkEmail ? (
        <div className="rounded-2xl border border-card-border bg-card p-4 text-center text-foreground">
          Verifique seu e-mail para confirmar o cadastro antes de entrar.
        </div>
      ) : (
        <>
          <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            {state.error === ALREADY_EXISTS_ERROR ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-accent bg-accent-soft p-4">
                <p className="text-sm font-semibold text-foreground">
                  Você já tem uma conta com esse e-mail — é só entrar, não precisa criar de novo.
                </p>
                <Link
                  href={entrarComEmailHref}
                  className="flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
                >
                  Entrar com esse e-mail
                </Link>
              </div>
            ) : (
              (formError || state.error) && (
                <p className="text-sm text-red-600">{formError ?? state.error}</p>
              )
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
            >
              {isPending ? "Criando..." : "Criar meu acesso"}
            </button>
          </form>

          <Link
            href={entrarHref}
            className="flex min-h-[52px] items-center justify-center rounded-2xl border border-card-border bg-card px-5 font-semibold text-primary"
          >
            Já possui uma conta? Entrar
          </Link>

          <p className="text-center text-xs text-muted">
            Ao se cadastrar, você concorda com nossa{" "}
            <Link href="/privacidade" className="underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </p>
        </>
      )}
    </main>
  );
}
