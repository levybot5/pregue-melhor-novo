"use server";

import { redirect } from "next/navigation";
import { signIn, getGoogleSignInUrl } from "@/services/auth";

export type EntrarState = { error: string | null };

export async function signInAction(
  _prevState: EntrarState,
  formData: FormData,
): Promise<EntrarState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const result = await signIn(email, password);

  if (result.status === "error") {
    return { error: result.message };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

// Mesmo botão serve pra entrar E cadastrar — o Google/Supabase decide
// sozinho se o e-mail já existe ou é conta nova, sem tela separada.
export async function signInWithGoogleAction(redirectTo: string): Promise<void> {
  const result = await getGoogleSignInUrl(redirectTo.startsWith("/") ? redirectTo : "/");
  if (result.status === "error") {
    // Sem estado de erro pra passar aqui (ação sem formData/useActionState) —
    // loga pra investigar e volta pra tela de entrar com aviso genérico.
    console.error("Falha ao iniciar login com Google:", result.message);
    redirect("/entrar?googleError=1");
  }
  redirect(result.url);
}
