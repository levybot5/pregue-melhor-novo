import "server-only";
import { getCurrentUser } from "@/services/auth";
import { DAILY_LIMIT, MONTHLY_LIMIT, type UsageTool } from "./limits";
import { isSubscriptionActive } from "./subscription";
import { getDailyUsageCount, getMonthlyUsageCount } from "./usage";
import { tryAcquireGenerationLock } from "./lock";

export type GenerationBlockReason =
  | "unauthenticated"
  | "inactive_subscription"
  | "daily_limit"
  | "monthly_limit"
  | "concurrent";

export type GenerationGuardResult =
  | { allowed: true; userId: string; dailyRemainingAfter: number }
  | { allowed: false; reason: GenerationBlockReason; message: string };

const DAILY_LIMIT_MESSAGE =
  "Você utilizou suas gerações disponíveis de hoje.\n\nNovas gerações estarão disponíveis amanhã.";
const MONTHLY_LIMIT_MESSAGE =
  "Você atingiu o limite de uso deste ciclo.\n\nSeu acesso será renovado no próximo ciclo.";
const INACTIVE_MESSAGE = "Seu acesso ao Pregue Melhor Pro não está ativo.";
const CONCURRENT_MESSAGE = "Já existe uma geração em andamento.";

function logDecision(params: {
  userId: string;
  tool: UsageTool;
  allowed: boolean;
  dailyUsed: number;
  monthlyUsed: number;
  reason: string;
}) {
  const shortUserId = params.userId.slice(0, 8);
  console.log(
    `[USAGE-LOG] user=${shortUserId} tool=${params.tool} allowed=${params.allowed} daily_used=${params.dailyUsed} monthly_used=${params.monthlyUsed} reason=${params.reason}`,
  );
}

// Checagem completa antes de QUALQUER chamada de IA:
// 1. autenticado, 2. assinatura ativa, 3. limite diário, 4. limite
// mensal, 5. sem geração simultânea/rate limit. Tudo via banco — nunca
// chama o Gemini. Se allowed=true, o chamador DEVE chamar
// releaseGenerationLock() depois (sucesso ou falha), em um finally.
export async function reserveGeneration(tool: UsageTool): Promise<GenerationGuardResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { allowed: false, reason: "unauthenticated", message: "Você precisa entrar para gerar." };
  }

  const active = await isSubscriptionActive(user.id);
  if (!active) {
    logDecision({ userId: user.id, tool, allowed: false, dailyUsed: 0, monthlyUsed: 0, reason: "inactive_subscription" });
    return { allowed: false, reason: "inactive_subscription", message: INACTIVE_MESSAGE };
  }

  const [dailyUsed, monthlyUsed] = await Promise.all([
    getDailyUsageCount(user.id),
    getMonthlyUsageCount(user.id),
  ]);

  if (dailyUsed >= DAILY_LIMIT) {
    logDecision({ userId: user.id, tool, allowed: false, dailyUsed, monthlyUsed, reason: "daily_limit" });
    return { allowed: false, reason: "daily_limit", message: DAILY_LIMIT_MESSAGE };
  }

  if (monthlyUsed >= MONTHLY_LIMIT) {
    logDecision({ userId: user.id, tool, allowed: false, dailyUsed, monthlyUsed, reason: "monthly_limit" });
    return { allowed: false, reason: "monthly_limit", message: MONTHLY_LIMIT_MESSAGE };
  }

  const lockResult = await tryAcquireGenerationLock();
  if (lockResult !== "ok") {
    logDecision({ userId: user.id, tool, allowed: false, dailyUsed, monthlyUsed, reason: lockResult });
    return { allowed: false, reason: "concurrent", message: CONCURRENT_MESSAGE };
  }

  logDecision({ userId: user.id, tool, allowed: true, dailyUsed, monthlyUsed, reason: "ok" });
  return { allowed: true, userId: user.id, dailyRemainingAfter: DAILY_LIMIT - dailyUsed - 1 };
}
