import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";
import { LOCK_STALE_SECONDS, MIN_INTERVAL_SECONDS } from "./limits";

export type LockResult = "ok" | "in_progress" | "rate_limited" | "unauthenticated";

// Reserva atômica no banco (ver migration: try_acquire_generation_lock)
// contra duas gerações simultâneas e contra início de geração antes de
// MIN_INTERVAL_SECONDS desde a última tentativa. Nunca chama o Gemini.
export async function tryAcquireGenerationLock(): Promise<LockResult> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("try_acquire_generation_lock", {
    p_min_interval_seconds: MIN_INTERVAL_SECONDS,
    p_stale_seconds: LOCK_STALE_SECONDS,
  });

  if (error) throw error;
  return data as LockResult;
}

// Sempre chamada depois da tentativa de geração (sucesso ou falha), em
// um finally — para não deixar o usuário travado esperando o timeout
// de staleness.
export async function releaseGenerationLock(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("release_generation_lock");
  if (error) throw error;
}
