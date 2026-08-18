import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";
import { getOrCreateDeviceId } from "./device";
import { LOCK_STALE_SECONDS, MIN_INTERVAL_SECONDS, TRIAL_LIMIT, type UsageTool } from "./limits";

type TrialReserveRpcResult =
  | "ok"
  | "limit_reached"
  | "in_progress"
  | "rate_limited"
  | "invalid_device";

export type TrialReserveResult =
  | { allowed: true; deviceId: string }
  | { allowed: false; reason: "trial_exhausted" | "concurrent" };

// Mesmo papel de reserveGeneration(), mas para visitante sem login (ou
// logado sem Pro — ver reserveGenerationOrTrial em guard.ts):
// verifica e reserva 1 uso do trial de forma atômica no banco (RPC
// try_reserve_trial_generation, migration 20260817120000). Nunca chama
// o Gemini. Quem chamar e receber allowed=true DEVE chamar
// releaseTrialLock() depois (sucesso ou falha), em um finally.
export async function reserveTrialGeneration(): Promise<TrialReserveResult> {
  const deviceId = await getOrCreateDeviceId();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.rpc("try_reserve_trial_generation", {
    p_device_id: deviceId,
    p_limit: TRIAL_LIMIT,
    p_min_interval_seconds: MIN_INTERVAL_SECONDS,
    p_stale_seconds: LOCK_STALE_SECONDS,
  });

  if (error) throw error;

  const result = data as TrialReserveRpcResult;
  if (result === "ok") {
    return { allowed: true, deviceId };
  }
  if (result === "limit_reached") {
    return { allowed: false, reason: "trial_exhausted" };
  }
  // "in_progress" | "rate_limited" | "invalid_device" — nenhum desses
  // deveria aparecer para o usuário como "acabou o trial".
  return { allowed: false, reason: "concurrent" };
}

// Sempre chamada depois da tentativa de geração (sucesso ou falha), em
// um finally — para não deixar o dispositivo travado esperando o
// timeout de staleness.
export async function releaseTrialLock(deviceId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("release_trial_lock", { p_device_id: deviceId });
  if (error) throw error;
}

// Só deve ser chamada depois que a IA retornar uma resposta válida —
// nunca antes, nunca em caso de erro/timeout.
export async function recordTrialUsage(deviceId: string, tool: UsageTool): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("record_trial_usage", {
    p_device_id: deviceId,
    p_tool: tool,
  });
  if (error) throw error;
}

// Usado só para EXIBIÇÃO ("N testes disponíveis"). A decisão real de
// permitir gerar é sempre reserveTrialGeneration().
export async function getTrialRemaining(): Promise<number> {
  const deviceId = await getOrCreateDeviceId();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_trial_usage_count", {
    p_device_id: deviceId,
  });

  if (error) throw error;
  return Math.max(0, TRIAL_LIMIT - (data ?? 0));
}
