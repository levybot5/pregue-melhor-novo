import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function EntrarPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Entrar</h1>
        <p className="text-muted">Acesse sua conta para continuar.</p>
      </header>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
