// Camada de dados do painel admin (/admin) — somente leitura. Cada
// função é um thin wrapper em volta de uma RPC SECURITY DEFINER que já
// confere is_current_user_admin() por dentro (defesa em profundidade,
// nunca confia só no gate de requireAdmin() na página). Mesma
// convenção de src/services/billing/index.ts.

export { requireAdmin } from "./guard";
export { getOverviewStats } from "./overview";
export type { OverviewStats } from "./overview";
export { listSubscribers, getSubscriberDetail } from "./subscribers";
export type {
  SubscriberListFilters,
  SubscriberListRow,
  SubscriberDetail,
  PaymentHistoryEntry,
  SubscriberStatus,
  SubscriberPaymentMethod,
} from "./subscribers";
export { getUsageStats } from "./usage";
export type { UsageStats } from "./usage";
export { getCohortRetention } from "./cohort";
export type { CohortRow } from "./cohort";
export { getChurnStats } from "./churn";
export type { ChurnStats, ChurnBreakdown } from "./churn";
export { getAtRiskSubscribers } from "./at-risk";
export type { AtRiskSubscriber, AtRiskSignal } from "./at-risk";
export { getTrends } from "./trends";
export type { Trends, MonthlyNet } from "./trends";
