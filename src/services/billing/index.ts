// Camada de assinatura, planos e limites de uso. Único ponto do app
// que decide se uma geração pode acontecer — nenhuma outra camada
// (componentes, actions das ferramentas) reimplementa essa lógica.
//
// Fluxo esperado em cada Server Action de geração:
//   1. reserveGeneration(tool) — auth + assinatura + limites + lock,
//      tudo via banco, nunca chama IA.
//   2. Se allowed, chamar a IA dentro de um try/finally que sempre
//      termina em releaseGenerationLock().
//   3. Só depois que a IA retornar uma resposta VÁLIDA: recordUsage().
//   4. autosave.

export { DAILY_LIMIT, MONTHLY_LIMIT, USAGE_TOOLS } from "./limits";
export type { UsageTool } from "./limits";

export { reserveGeneration } from "./guard";
export type { GenerationGuardResult, GenerationBlockReason } from "./guard";

export { releaseGenerationLock } from "./lock";
export { recordUsage } from "./usage";
export { getGenerationStatus } from "./status";
export type { GenerationStatus } from "./status";
export { getCurrentSubscription } from "./subscription";
export type { Subscription, SubscriptionStatus } from "./subscription";
