import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = [
  "/pregacao",
  "/esboco-pulpito",
  "/esboco-pregacao",
  "/biblia",
  "/biblioteca",
  "/pregacoes-prontas",
  "/esbocos-prontos",
  "/apoio-do-pregador",
  "/devocional",
  "/dicionario",
];

const AUTH_PATHS = ["/entrar", "/cadastrar"];

// Renomeado de middleware.ts para proxy.ts no Next.js 16 (mesma função).
// Responsabilidades: renovar a sessão a cada navegação e bloquear o
// acesso às rotas protegidas antes de renderizar. Isso é só a camada de
// UX — cada Server Action/página também reverifica a sessão, porque um
// matcher mal configurado não pode ser a única proteção (ver services
// de auth e database).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPath = AUTH_PATHS.includes(pathname);

  if (isProtected && !isAuthenticated) {
    const redirectUrl = new URL("/entrar", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon$|icon-192|icon-512|apple-icon|manifest.webmanifest|sw.js).*)",
  ],
};
