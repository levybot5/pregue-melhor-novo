import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";
import { LOCK_STALE_SECONDS, MIN_INTERVAL_SECONDS, TRIAL_LIMIT, type UsageTool } from "./limits";

type TrialReserveRpcResult =
  | "ok"
  | "limit_reached"
  | "in_progress"
  | "rate_limited"
  | "unauthenticated";

export type TrialReserveResult =
  | { allowed: true }
  | { allowed: false; reason: "trial_exhausted" | "concurrent" };

// Trial agora é por CONTA (auth.uid()), não mais por device_id — desde
// que cadastro passou a ser obrigatório antes de qualquer acesso ao
// app, não existe mais visitante anônimo usando ferramenta nenhuma.
// Mesmo papel de reserveGeneration(): verifica e reserva 1 uso do
// trial de forma atômica no banco (RPC try_reserve_user_trial_generation,
// migration 20260821230000 — espelha generation_locks/
// try_acquire_generation_lock, auth.uid() lido dentro da função, nunca
// um parâmetro). Nunca chama o Gemini. Quem chamar e receber
// allowed=true DEVE chamar releaseTrialLock() depois (sucesso ou
// falha), em um finally.
export async function reserveTrialGeneration(): Promise<TrialReserveResult> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.rpc("try_reserve_user_trial_generation", {
    p_limit: TRIAL_LIMIT,
    p_min_interval_seconds: MIN_INTERVAL_SECONDS,
    p_stale_seconds: LOCK_STALE_SECONDS,
  });

  if (error) throw error;

  const result = data as TrialReserveRpcResult;
  if (result === "ok") {
    return { allowed: true };
  }
  if (result === "limit_reached") {
    return { allowed: false, reason: "trial_exhausted" };
  }
  // "in_progress" | "rate_limited" | "unauthenticated" — nenhum desses
  // deveria aparecer para o usuário como "acabou o trial". Na prática
  // "unauthenticated" não deveria acontecer aqui: o proxy já garante
  // sessão antes de qualquer página renderizar.
  return { allowed: false, reason: "concurrent" };
}

// Sempre chamada depois da tentativa de geração (sucesso ou falha), em
// um finally — para não deixar a conta travada esperando o timeout de
// staleness.
export async function releaseTrialLock(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("release_user_trial_lock");
  if (error) throw error;
}

// Só deve ser chamada depois que a IA retornar uma resposta válida —
// nunca antes, nunca em caso de erro/timeout.
export async function recordTrialUsage(tool: UsageTool): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("record_user_trial_usage", { p_tool: tool });
  if (error) throw error;
}

// Usado só para EXIBIÇÃO ("N testes disponíveis"). A decisão real de
// permitir gerar é sempre reserveTrialGeneration().
export async function getTrialRemaining(): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_user_trial_usage_count");
  if (error) throw error;
  return Math.max(0, TRIAL_LIMIT - (data ?? 0));
}
