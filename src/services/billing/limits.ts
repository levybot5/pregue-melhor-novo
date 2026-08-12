// Limites do plano PRO (único plano existente nesta etapa). Sem
// gateway de pagamento ainda — ver src/services/billing/subscription.ts.

// Visível ao usuário na interface.
export const DAILY_LIMIT = 20;

// Proteção interna contra abuso — nunca exibido normalmente.
export const MONTHLY_LIMIT = 500;

// Rate limit técnico: mínimo de segundos entre inícios de geração do
// mesmo usuário. Não é regra comercial, não aparece na interface.
export const MIN_INTERVAL_SECONDS = 5;

// Depois desse tempo, um lock "em andamento" é considerado travado
// (ex.: processo morreu no meio) e pode ser retomado por uma nova
// tentativa.
export const LOCK_STALE_SECONDS = 60;

export const USAGE_TOOLS = [
  "pregacao",
  "biblia_explicada",
  "esboco_pregacao",
  "esboco_pulpito",
  "devocional",
] as const;

export type UsageTool = (typeof USAGE_TOOLS)[number];
