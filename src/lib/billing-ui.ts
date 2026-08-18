import type { GenerationBlockReason } from "@/services/billing";

// "daily_limit"/"monthly_limit" merecem o painel dedicado (GenerationBlockedNotice).
// Os demais motivos ("concurrent", "unauthenticated") viram um erro
// inline comum — não são estados comerciais, são proteção técnica.
export function isLimitBlockReason(reason: GenerationBlockReason): boolean {
  return reason === "daily_limit" || reason === "monthly_limit";
}

// "trial_exhausted" tem sua própria tela (TrialPaywallNotice, com
// preço e CTA) — não é o mesmo painel genérico de limite diário/mensal.
export function isTrialExhaustedReason(reason: GenerationBlockReason): boolean {
  return reason === "trial_exhausted";
}

// "subscription_expired" (PIX vencido, cartão cancelado) tem tela
// própria de RENOVAÇÃO (RenewalNotice) — nunca a de trial, mesmo que o
// dispositivo ainda tivesse testes grátis sobrando (quem já foi
// assinante não volta a ver "testes grátis").
export function isSubscriptionExpiredReason(reason: GenerationBlockReason): boolean {
  return reason === "subscription_expired";
}
