import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client ADMIN (service role) — ignora RLS por completo. Só pode ser
// importado por código server-only que realmente precisa escrever em
// nome do sistema (hoje: só o webhook do Mercado Pago). Nunca importar
// isto em Server Actions acionadas por clique do usuário, nem em
// qualquer módulo que possa acabar em um Client Component.
//
// Por isso este arquivo NÃO é reexportado por services/database/index.ts
// — quem precisa dele importa diretamente daqui, de propósito.
let client: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin não configurado: defina SUPABASE_SERVICE_ROLE_KEY em .env.local",
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
