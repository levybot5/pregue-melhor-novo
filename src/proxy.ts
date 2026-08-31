import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEVICE_ID_COOKIE } from "@/services/billing/device";

// Cadastro é obrigatório antes de QUALQUER acesso ao app — inclusive
// as 6 ferramentas de IA e a Home. O trial (3 gerações grátis) agora é
// por conta (auth.uid(), ver services/billing/trial.ts), não mais por
// device_id/cookie. Por isso o modelo de gate virou o oposto de antes:
// em vez de listar rotas protegidas, listamos as poucas rotas
// PÚBLICAS — tudo que não estiver aqui exige sessão.
const PUBLIC_PATHS = [
  "/entrar",
  "/cadastrar",
  "/esqueci-senha",
  "/redefinir-senha",
  "/privacidade",
  // Página de oferta (landing de anúncio) — movida do Artifact avulso pra
  // dentro do app, precisa ficar acessível sem login.
  "/oferta",
  // Reconciliação de compras Pix antigas pagas mas nunca vinculadas a
  // uma conta (de antes desta mudança) — ver AsaasSignupForm.tsx e o
  // branch anônimo de planos/retorno/page.tsx. Não é mais alcançável
  // por compras novas (checkout agora só existe logado), mas precisa
  // continuar público pra quem ainda tiver um link antigo.
  "/planos/retorno",
];

const PUBLIC_API_PREFIXES = ["/api/webhooks", "/api/auth/callback", "/api/cron"];

const AUTH_PATHS = ["/entrar", "/cadastrar"];

const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // ~400 dias (máximo aceito por navegadores)

// Renomeado de middleware.ts para proxy.ts no Next.js 16 (mesma função).
// Responsabilidades: renovar a sessão a cada navegação, garantir o
// device_id (cookie HttpOnly, nunca localStorage — ainda usado pelo
// checkout, mas não mais pelo trial) e bloquear o acesso a tudo que
// não estiver em PUBLIC_PATHS antes de renderizar. Isso é só a camada
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
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isAuthPath = AUTH_PATHS.includes(pathname);

  if (!isPublic && !isAuthenticated) {
    // /cadastrar, não /entrar: quem chega pela primeira vez raramente
    // já tem conta — "Entrar" pressupõe credencial existente e confunde
    // visitante novo. A tela de cadastro já linka pra "Já possui uma
    // conta? Entrar" pra quem precisar.
    const redirectUrl = new URL("/cadastrar", request.url);
    // Repassa fbclid/utm_* (e qualquer outro parâmetro) da URL
    // original — sem isso, quem clica num anúncio e cai aqui pela
    // primeira vez (o caso mais comum: visitante novo, sem cookie
    // ainda) perdia o fbclid neste redirect antes do pixel do
    // Facebook (MetaPixel.tsx) ter a chance de gravar o cookie _fbc.
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
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
    // "brand" e "home" excluídos pelo mesmo motivo: o otimizador de
    // imagem do Next (/_next/image) busca o arquivo original em
    // /brand/... e /home/... por baixo dos panos — sem essa exceção,
    // esse fetch interno caía no gate de auth (AuthLogo quebrou antes
    // por isso; agora as capas dos cards da home fariam o mesmo).
    // "videos/" excluído pelo mesmo motivo: os vídeos de demonstração da
    // página de oferta (pública, sem login) ficam em public/videos/ —
    // sem essa exceção, o <video> pedia o arquivo e caía no gate de auth
    // (a tag recebia o HTML do redirect pro /cadastrar em vez do vídeo,
    // e por isso nunca tocava — nem manualmente, nem em autoplay).
    // "images/" pelo mesmo motivo: imagens promocionais da página de
    // oferta (public/images/).
    "/((?!_next/static|_next/image|favicon.ico|icon$|icon-192|icon-512|apple-icon|manifest.webmanifest|sw.js|brand/|home/|videos/|images/).*)",
  ],
};
