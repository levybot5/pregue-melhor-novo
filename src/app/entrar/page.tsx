import { Suspense } from "react";
import { AuthLogo } from "@/components/AuthLogo";
import { BackLink } from "@/components/reading";
import { LoginForm } from "./LoginForm";

export default function EntrarPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/" />
      <AuthLogo />

      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Entre na sua conta
        </h1>
      </header>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
