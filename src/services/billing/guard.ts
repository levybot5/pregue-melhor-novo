import "server-only";
import { getCurrentUser } from "@/services/auth";
import { DAILY_LIMIT, MONTHLY_LIMIT, type UsageTool } from "./limits";
import { getCurrentSubscription, isSubscriptionActive } from "./subscription";
import { getDailyUsageCount, getMonthlyUsageCount, recordUsage } from "./usage";
import { tryAcquireGenerationLock, releaseGenerationLock } from "./lock";
import { reserveTrialGeneration, releaseTrialLock, recordTrialUsage } from "./trial";

export type GenerationBlockReason =
  | "unauthenticated"
  | "inactive_subscription"
  | "daily_limit"
  | "monthly_limit"
  | "concurrent"
  | "trial_exhausted"
  | "subscription_expired";

// Resultado de reserveGenerationOrTrial(): "subscriber" é o fluxo
// normal (autenticado + Pro ativo, limites diário/mensal); "trial" é
// visitante sem login OU logado sem Pro (ver item 13 do pedido),
// controlado por device_id em vez de user_id.
export type GenerationReservation =
  | { allowed: true; mode: "subscriber"; userId: string; dailyRemainingAfter: number }
  | { allowed: true; mode: "trial"; deviceId: string }
  | { allowed: false; reason: GenerationBlockReason; message: string };

const DAILY_LIMIT_MESSAGE =
  "Você utilizou suas gerações disponíveis de hoje.\n\nNovas gerações estarão disponíveis amanhã.";
const MONTHLY_LIMIT_MESSAGE =
  "Você atingiu o limite de uso deste ciclo.\n\nSeu acesso será renovado no próximo ciclo.";
const CONCURRENT_MESSAGE = "Já existe uma geração em andamento.";
const TRIAL_EXHAUSTED_MESSAGE = "Você já utilizou suas 3 gerações gratuitas.";
const SUBSCRIPTION_EXPIRED_MESSAGE = "Seu acesso ao Pregue Melhor Pro venceu.";

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

// Checagem completa antes de QUALQUER chamada de IA nas 6 ferramentas
// elegíveis ao trial (ver USAGE_TOOLS). Autenticado com Pro ativo:
// mesmos limites diário/mensal de sempre (mode "subscriber") — quem
// não tem Pro ativo cai no trial por device_id (mode "trial"), tanto para
// visitante sem conta quanto para usuário logado sem assinatura ativa
// (o trial é por dispositivo, nunca reinicia por login/logout). Se
// allowed=true, o chamador DEVE chamar releaseReservation() depois
// (sucesso ou falha), em um finally.
export async function reserveGenerationOrTrial(tool: UsageTool): Promise<GenerationReservation> {
  const user = await getCurrentUser();

  if (user) {
    const active = await isSubscriptionActive(user.id);
    if (active) {
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
      return {
        allowed: true,
        mode: "subscriber",
        userId: user.id,
        dailyRemainingAfter: DAILY_LIMIT - dailyUsed - 1,
      };
    }

    // Já teve Pro (PIX vencido, cartão cancelado/inadimplente): tela
    // de RENOVAÇÃO específica, nunca a de trial — não faz sentido
    // devolver "testes grátis" pra quem já foi assinante (item 16 do
    // pedido de checkout). Quem NUNCA assinou (subscription === null)
    // continua caindo no trial normalmente, abaixo.
    const subscription = await getCurrentSubscription(user.id);
    if (subscription) {
      return {
        allowed: false,
        reason: "subscription_expired",
        message: SUBSCRIPTION_EXPIRED_MESSAGE,
      };
    }
    // Nunca assinou: cai no trial por device_id abaixo (item 13 do
    // pedido) — não bloqueia mais com "inactive_subscription".
  }

  const trial = await reserveTrialGeneration();
  if (!trial.allowed) {
    if (trial.reason === "trial_exhausted") {
      return { allowed: false, reason: "trial_exhausted", message: TRIAL_EXHAUSTED_MESSAGE };
    }
    return { allowed: false, reason: "concurrent", message: CONCURRENT_MESSAGE };
  }

  return { allowed: true, mode: "trial", deviceId: trial.deviceId };
}

// Libera o lock certo (subscriber ou trial) — sempre em um finally,
// sucesso ou falha da geração.
export async function releaseReservation(reservation: GenerationReservation): Promise<void> {
  if (!reservation.allowed) return;
  if (reservation.mode === "subscriber") {
    await releaseGenerationLock();
  } else {
    await releaseTrialLock(reservation.deviceId);
  }
}

// Só deve ser chamada depois que a IA retornar uma resposta válida —
// nunca antes, nunca em caso de erro/timeout.
export async function recordReservationUsage(
  reservation: GenerationReservation,
  tool: UsageTool,
): Promise<void> {
  if (!reservation.allowed) return;
  if (reservation.mode === "subscriber") {
    await recordUsage(reservation.userId, tool);
  } else {
    await recordTrialUsage(reservation.deviceId, tool);
  }
}
