import Link from "next/link";
import { AuthLogo } from "@/components/AuthLogo";
import { getCurrentUser } from "@/services/auth";
import { RedefinirSenhaForm } from "./RedefinirSenhaForm";

// Só acessível com a sessão de recuperação estabelecida pelo link de
// e-mail (ver src/app/api/auth/callback/route.ts). Sem sessão válida,
// mostra aviso em vez do formulário — não redireciona para /entrar
// para não confundir quem acabou de clicar no link do e-mail.
export default async function RedefinirSenhaPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <AuthLogo />

      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nova senha</h1>
      </header>

      {user ? (
        <RedefinirSenhaForm />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-card-border bg-card p-4 text-center text-foreground">
          <p>Este link expirou ou já foi usado.</p>
          <Link
            href="/esqueci-senha"
            className="font-medium text-primary underline underline-offset-4"
          >
            Solicitar novo link
          </Link>
        </div>
      )}
    </main>
  );
}
