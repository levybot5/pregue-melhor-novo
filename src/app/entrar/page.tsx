import { Suspense } from "react";
import { AuthLogo } from "@/components/AuthLogo";
import { BackLink } from "@/components/reading";
import { LoginForm } from "./LoginForm";

export default function EntrarPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.25rem)] lg:max-w-md lg:justify-center lg:rounded-3xl lg:border lg:border-card-border lg:bg-card lg:p-10 lg:pt-10 lg:shadow-xl">
      <BackLink href="/" />
      <AuthLogo />

      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Entre na sua conta
        </h1>
      </header>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
