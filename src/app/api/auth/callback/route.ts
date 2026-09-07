import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/services/database/server-client";

// Troca o token do link de e-mail pela sessão real, via Supabase Auth
// — nenhuma lógica própria de autenticação. Rota GET porque quem chama
// é o link clicado no e-mail, nunca um fetch da aplicação.
//
// token_hash+type (recuperação de senha, ver template "Reset Password"
// no painel do Supabase): verifyOtp() não depende de cookie nenhum
// criado antes — funciona mesmo se o link for aberto num navegador
// diferente do que pediu a redefinição (comum no celular: pedir no
// Chrome e abrir o link dentro do app do Gmail, que tem seu próprio
// navegador embutido, sem os cookies do Chrome). "code" (compat com
// outros fluxos, ex.: confirmação de cadastro) exige o code_verifier
// do mesmo navegador — mais frágil para link de e-mail, por isso a
// redefinição de senha não usa mais esse caminho.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await getSupabaseServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar`);
}
