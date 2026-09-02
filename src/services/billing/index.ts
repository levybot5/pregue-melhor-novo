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

export { DAILY_LIMIT, MONTHLY_LIMIT, TRIAL_LIMIT, USAGE_TOOLS } from "./limits";
export type { UsageTool } from "./limits";

export { reserveGenerationOrTrial, releaseReservation, recordReservationUsage } from "./guard";
export type { GenerationReservation, GenerationBlockReason } from "./guard";

export { getGenerationStatus } from "./status";
export type { GenerationStatus } from "./status";
export { getCurrentSubscription, getDaysUntilExpiry } from "./subscription";
export type { Subscription, SubscriptionStatus } from "./subscription";
export { getTrialRemaining } from "./trial";

export {
  createPixPurchase,
  createHostedCheckout,
  getPurchaseStatus,
  claimPendingPurchase,
  InvalidPixPurchaseInputError,
} from "./purchase";
export type {
  PaymentMethod,
  PixPurchaseInput,
  PixPurchaseResult,
  HostedCheckoutInput,
  HostedCheckoutResult,
  PurchaseStatusResult,
  ClaimPurchaseResult,
} from "./purchase";

export { PLANS, KIT_PRICE, KIT_LABEL, DEFAULT_PLAN_ID, isPlanId, PRO_PRICE } from "./pricing";
export type { PlanId, Plan } from "./pricing";
export { hasKitAccess } from "./kit";
