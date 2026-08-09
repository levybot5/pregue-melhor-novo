import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Client por requisição, ligado aos cookies de sessão do usuário.
// Toda query feita com este client respeita o RLS como o usuário
// autenticado (auth.uid()) — nunca como admin. Nunca reutilizar entre
// requisições: cada Server Component/Action deve criar o seu.
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado a partir de um Server Component, que não pode
          // escrever cookies — o proxy.ts cuida de renovar a sessão.
        }
      },
    },
  });
}
