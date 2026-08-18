import "server-only";
import { cookies } from "next/headers";

// Cookie HttpOnly (nunca localStorage) — identifica o dispositivo para
// o trial sem login. Já é criado pelo proxy.ts em toda requisição, o
// que cobre a leitura em Server Components (a página inicial já vê o
// cookie no primeiro request). Esta função é só uma rede de segurança
// para quem chamar antes do proxy rodar por algum motivo (ex.: rota
// fora do matcher) — tenta criar aqui também.
export const DEVICE_ID_COOKIE = "pm_device_id";

const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // ~400 dias (máximo aceito por navegadores)

export async function getOrCreateDeviceId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(DEVICE_ID_COOKIE)?.value;
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  try {
    store.set(DEVICE_ID_COOKIE, deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DEVICE_ID_MAX_AGE_SECONDS,
    });
  } catch {
    // Chamado a partir de um Server Component, que não pode escrever
    // cookies — o proxy.ts já deveria ter criado o cookie antes disso.
  }
  return deviceId;
}
