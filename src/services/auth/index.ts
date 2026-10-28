import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { getSupabaseServerClient } from "@/services/database/server-client";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { REFERRAL_COOKIE } from "@/services/billing/referral";
import { sendPasswordResetEmail } from "@/services/email/password-reset";

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

// E-mail não deveria ser case-sensitive pra ninguém — sem isso, alguém
// que cadastrou com "nome@..." e depois digita "Nome@..." pra entrar
// (ex.: teclado com autocapitalização) levava "e-mail ou senha
// incorretos" mesmo com a senha certa.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// "name" é opcional: o cadastro normal (/cadastrar) não pede mais nome
// (só e-mail + senha) — o parâmetro só existe pra manter o fluxo
// pós-pagamento (planos/retorno/AsaasSignupForm.tsx, que ainda pede
// nome) funcionando sem mudar aquela tela.
export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();

  // Programa de indicação: o cookie só existe se alguém chegou por um
  // link com ?ref=<user_id> válido (ver proxy.ts) — vira metadado do
  // cadastro, lido pelo trigger handle_new_user() no banco (migration
  // 20260919190000) pra preencher profiles.referred_by. Não valida o
  // uuid aqui de novo: um valor malformado ou de usuário inexistente é
  // simplesmente ignorado lá, nunca trava o cadastro.
  const referredBy = (await cookies()).get(REFERRAL_COOKIE)?.value;
  const metadata: Record<string, string> = {};
  if (name) metadata.name = name;
  if (referredBy) metadata.referred_by = referredBy;

  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: Object.keys(metadata).length > 0 ? { data: metadata } : undefined,
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
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    console.error("Falha no login:", error.status, error.message);
    return { status: "error", message: translateAuthError(error.message) };
  }

  return { status: "ok" };
}

export type OAuthUrlResult = { status: "ok"; url: string } | { status: "error"; message: string };

// Google (sem senha nenhuma — item "facilitar a entrada dos leads").
// Só CALCULA a URL de consentimento do Google aqui no servidor; quem
// redireciona de verdade é a Server Action que chama isto (redirect()
// do Next.js aceita URL externa). Serve tanto pra quem já tem conta
// quanto pra quem nunca cadastrou — o Supabase cria a conta sozinho no
// primeiro login com um e-mail novo, sem tela de cadastro separada.
// /api/auth/callback (já existe, usado por confirmação de e-mail/
// redefinição de senha) já sabe trocar esse "code" pela sessão real —
// nada novo precisou ser criado lá.
export async function getGoogleSignInUrl(redirectTo: string): Promise<OAuthUrlResult> {
  // Origem vem da própria requisição, não de APP_URL: a volta do Google é
  // aberta no navegador da pessoa, então tem que ser o domínio em que ela
  // está agora. APP_URL é só para callback de webhook (túnel em dev) e na
  // primeira versão desta função, apontando pra ele, o retorno do Google
  // ia parar num endereço que não existe.
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    return { status: "error", message: "Não foi possível identificar o endereço do site." };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error || !data.url) {
    console.error("Falha ao iniciar login com Google:", error?.status, error?.message);
    return { status: "error", message: "Não foi possível abrir o login com Google agora." };
  }

  return { status: "ok", url: data.url };
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
  const normalizedEmail = normalizeEmail(email);

  // Caminho principal: e-mail próprio via Resend, com link que abre o
  // formulário direto (ver services/email/password-reset.ts). Se o
  // envio falhar (Resend fora do ar/sem chave), cai no e-mail padrão
  // do Supabase em vez de deixar a pessoa sem nenhuma saída.
  try {
    await sendPasswordResetEmail(
      normalizedEmail,
      siteUrl ?? "https://pregue-melhor-novo-gules.vercel.app",
    );
    return;
  } catch (error) {
    console.error("Falha ao enviar e-mail de redefinição pelo Resend:", error);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
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

// Link do e-mail próprio (ver services/email/password-reset.ts): o
// token só é consumido aqui, junto com a senha nova — abrir a página
// não gasta o link nem exige cookie de um pedido anterior.
export async function updatePasswordWithToken(
  tokenHash: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (verifyError) {
    console.error("Token de redefinição inválido:", verifyError.status, verifyError.message);
    return { status: "error", message: "Este link expirou ou já foi usado. Peça um novo link." };
  }

  return updatePassword(password);
}

// LGPD: a pessoa tem que poder excluir a própria conta sem depender de
// pedir pra alguém (é assim que o app fica sem operações manuais
// arriscadas — ver histórico de exclusão feita por engano nesta
// sessão). auth.admin.deleteUser() só existe na API admin (service
// role) — não tem "self-delete" no client SDK do Supabase. Único caso
// aprovado de usar o admin client num clique do usuário, porque o id
// vem exclusivamente de getCurrentUser() (sessão validada no
// servidor), nunca de um parâmetro — não dá pra essa função apagar a
// conta de outra pessoa. FKs em cascade (contents, subscriptions,
// favorites, course_progress etc.) limpam o resto sozinhas.
export async function deleteOwnAccount(): Promise<AuthActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Você precisa entrar para excluir sua conta." };
  }

  const admin = getSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Falha ao excluir conta:", error.status, error.message);
    return {
      status: "error",
      message: "Não foi possível excluir sua conta agora. Tente novamente.",
    };
  }

  await signOut();
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
