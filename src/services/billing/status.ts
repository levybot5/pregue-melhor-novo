import "server-only";
import { DAILY_LIMIT } from "./limits";
import { isSubscriptionActive } from "./subscription";
import { getDailyUsageCount } from "./usage";

export type GenerationStatus = {
  subscriptionActive: boolean;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
};

// Usado só para EXIBIÇÃO (Home e páginas das ferramentas). A decisão
// real de permitir ou não gerar é sempre feita de novo, no servidor,
// por reserveGeneration() — o frontend nunca decide isso sozinho.
export async function getGenerationStatus(userId: string): Promise<GenerationStatus> {
  const [active, dailyUsed] = await Promise.all([
    isSubscriptionActive(userId),
    getDailyUsageCount(userId),
  ]);

  return {
    subscriptionActive: active,
    dailyLimit: DAILY_LIMIT,
    dailyUsed,
    dailyRemaining: Math.max(0, DAILY_LIMIT - dailyUsed),
  };
}
