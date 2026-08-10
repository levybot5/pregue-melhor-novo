import type { GenerationBlockReason } from "@/services/billing";

// "daily_limit"/"monthly_limit" merecem o painel dedicado (GenerationBlockedNotice).
// Os demais motivos ("concurrent", "unauthenticated") viram um erro
// inline comum — não são estados comerciais, são proteção técnica.
export function isLimitBlockReason(reason: GenerationBlockReason): boolean {
  return reason === "daily_limit" || reason === "monthly_limit";
}
