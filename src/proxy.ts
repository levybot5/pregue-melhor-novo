import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEVICE_ID_COOKIE } from "@/services/billing/device";

// As 6 ferramentas com geração por IA (pregacao, biblia, esboco-*,
// devocional, dicionario) NÃO ficam mais aqui: visitante sem login
// pode usá-las em modo trial (3 gerações grátis por dispositivo — ver
// services/billing/trial.ts). O que continua exigindo conta é o que
// depende de dado pertencente ao usuário (Biblioteca, Academia,
// conteúdo pronto).
const PROTECTED_PREFIXES = [
  "/biblioteca",
  "/pregacoes-prontas",
  "/esbocos-prontos",
  "/academia",
];

const AUTH_PATHS = ["/entrar", "/cadastrar"];

const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // ~400 dias (máximo aceito por navegadores)

// Renomeado de middleware.ts para proxy.ts no Next.js 16 (mesma função).
// Responsabilidades: renovar a sessão a cada navegação, garantir o
// device_id do trial (cookie HttpOnly, nunca localStorage) e bloquear
// o acesso às rotas protegidas antes de renderizar. Isso é só a camada
// de UX — cada Server Action/página também reverifica sessão e trial,
// porque um matcher mal configurado não pode ser a única proteção (ver
// services de auth, database e billing).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Grava no request (visível para Server Components/Actions desta
  // mesma requisição) — o Set-Cookie real na response só é aplicado no
  // final, via finishWithDeviceCookie(), porque a sincronização de
  // sessão do Supabase abaixo pode recriar `response` mais de uma vez
  // (perderíamos o cookie se só o setássemos aqui).
  const existingDeviceId = request.cookies.get(DEVICE_ID_COOKIE)?.value;
  const deviceId = existingDeviceId ?? crypto.randomUUID();
  if (!existingDeviceId) {
    request.cookies.set(DEVICE_ID_COOKIE, deviceId);
    response = NextResponse.next({ request });
  }

  function finishWithDeviceCookie(res: NextResponse): NextResponse {
    if (!existingDeviceId) {
      res.cookies.set(DEVICE_ID_COOKIE, deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: DEVICE_ID_MAX_AGE_SECONDS,
      });
    }
    return res;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return finishWithDeviceCookie(response);
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
    return finishWithDeviceCookie(NextResponse.redirect(redirectUrl));
  }

  if (isAuthPath && isAuthenticated) {
    return finishWithDeviceCookie(NextResponse.redirect(new URL("/", request.url)));
  }

  return finishWithDeviceCookie(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon$|icon-192|icon-512|apple-icon|manifest.webmanifest|sw.js).*)",
  ],
};
