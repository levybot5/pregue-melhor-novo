import "server-only";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/services/database/server-client";
import type { UsageTool } from "./limits";

// Brasil não tem mais horário de verão (desde 2019), então um offset
// fixo de -3h é suficiente para "hoje" e "este mês" fazerem sentido
// para o usuário, sem guardar timezone por conta.
const BRAZIL_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

function startOfBrazilDay(reference: Date): Date {
  const brazilLocal = new Date(reference.getTime() - BRAZIL_UTC_OFFSET_MS);
  const startLocal = Date.UTC(
    brazilLocal.getUTCFullYear(),
    brazilLocal.getUTCMonth(),
    brazilLocal.getUTCDate(),
  );
  return new Date(startLocal + BRAZIL_UTC_OFFSET_MS);
}

function startOfBrazilMonth(reference: Date): Date {
  const brazilLocal = new Date(reference.getTime() - BRAZIL_UTC_OFFSET_MS);
  const startLocal = Date.UTC(brazilLocal.getUTCFullYear(), brazilLocal.getUTCMonth(), 1);
  return new Date(startLocal + BRAZIL_UTC_OFFSET_MS);
}

async function countUsageSince(userId: string, since: Date): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const { count, error } = await supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());

  if (error) throw error;
  return count ?? 0;
}

export async function getDailyUsageCount(userId: string, now = new Date()): Promise<number> {
  return countUsageSince(userId, startOfBrazilDay(now));
}

export async function getMonthlyUsageCount(userId: string, now = new Date()): Promise<number> {
  return countUsageSince(userId, startOfBrazilMonth(now));
}

// Só deve ser chamada depois que a IA retornar uma resposta válida —
// nunca antes, nunca em caso de erro/timeout.
export async function recordUsage(userId: string, tool: UsageTool): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("usage_events").insert({ user_id: userId, tool });
  if (error) throw error;

  // O contador "N gerações disponíveis hoje" aparece na Home e nas 4
  // ferramentas. Sem isso, o Router Cache do Next pode continuar
  // mostrando o número antigo até um reload manual. Isso só marca o
  // cache do cliente como desatualizado — não é polling nem chamada
  // de IA, e não muda a lógica de limite (que já é sempre recalculada
  // do banco a cada tentativa, independente de cache).
  revalidatePath("/", "layout");
}
