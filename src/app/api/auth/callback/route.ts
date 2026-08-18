import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/services/database/server-client";

// Troca o "code" do link de e-mail (redefinição de senha, confirmação)
// pela sessão real, via Supabase Auth — nenhuma lógica própria de
// autenticação. Rota GET porque quem chama é o link clicado no e-mail,
// nunca um fetch da aplicação.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar`);
}
