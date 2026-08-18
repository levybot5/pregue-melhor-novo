import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type CurrentUser = {
  id: string;
  email: string | null;
};

// Deriva o usuário a partir da sessão (cookies), nunca de um valor
// enviado pelo cliente. getClaims() valida o JWT localmente — rápido e
// seguro para proteger páginas e dados. Cacheado por requisição.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) return null;

  return { id: data.claims.sub, email: data.claims.email ?? null };
});

export type AuthActionResult =
  | { status: "ok" }
  | { status: "check_email" }
  | { status: "error"; message: string };

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    console.error("Falha no cadastro:", error.status, error.message);
    return { status: "error", message: translateAuthError(error.message) };
  }

  // Sem sessão retornada = confirmação de e-mail pendente no projeto.
  if (!data.session) {
    return { status: "check_email" };
  }

  return { status: "ok" };
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Falha no login:", error.status, error.message);
    return { status: "error", message: translateAuthError(error.message) };
  }

  return { status: "ok" };
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
}

// Envia o e-mail de redefinição de senha via Supabase Auth (fluxo
// padrão, sem sessão própria). Sempre retorna sucesso do ponto de
// vista de quem chama — não revela se o e-mail tem conta ou não, para
// não permitir enumeração de contas.
export async function requestPasswordReset(email: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  // NEXT_PUBLIC_SITE_URL (não APP_URL): este link é aberto pelo
  // próprio navegador de quem clicou no e-mail, nunca por um servidor
  // externo — APP_URL é só pra callback de webhook/checkout que
  // precisa ser alcançável de fora (ex.: túnel em desenvolvimento).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl ? `${siteUrl}/api/auth/callback?next=/redefinir-senha` : undefined,
  });

  if (error) {
    console.error("Falha ao solicitar redefinição de senha:", error.status, error.message);
  }
}

// Só funciona com a sessão de recuperação estabelecida pelo link de
// e-mail (ver src/app/api/auth/callback/route.ts) — getCurrentUser()
// deve confirmar sessão válida antes de chamar isto.
export async function updatePassword(password: string): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Falha ao redefinir senha:", error.status, error.message);
    return { status: "error", message: translateAuthError(error.message) };
  }

  return { status: "ok" };
}

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (message.includes("User already registered")) {
    return "Já existe uma conta com este e-mail.";
  }
  if (message.includes("Password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (message.includes("Email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (message.includes("should be different from the old password")) {
    return "A nova senha precisa ser diferente da senha atual.";
  }
  return "Não foi possível concluir agora. Tente novamente.";
}
