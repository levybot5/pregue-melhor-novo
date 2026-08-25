// Fonte única de preços/duração dos planos e do Kit avulso. Sem
// "server-only" de propósito: PLANS/KIT_PRICE são só números públicos
// (já aparecem na tela), sem segredo nem acesso a banco — isso permite
// importar este arquivo tanto de Server Components/services quanto de
// Client Components (PagarForm.tsx precisa mostrar preço/total sem
// duplicar os literais).
//
// Isto NÃO é usado pro cálculo de MRR do painel admin — MRR usa o
// valor real de cada pagamento (pending_purchases.amount), porque se
// o preço mudar no futuro, assinantes antigos continuam pagando o
// valor de quando entraram (regra explícita: "não assumir que todos
// sempre pagarão o mesmo valor"). Esta constante só decide quanto
// cobrar em uma cobrança NOVA.

export type PlanId = "mensal" | "trimestral";

export type Plan = {
  id: PlanId;
  label: string;
  price: number; // reais
  days: number; // duração do acesso, em dias
};

export const PLANS: Record<PlanId, Plan> = {
  mensal: { id: "mensal", label: "Mensal", price: 10, days: 30 },
  trimestral: { id: "trimestral", label: "Trimestral", price: 27, days: 90 },
};

export const DEFAULT_PLAN_ID: PlanId = "mensal";

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "mensal" || value === "trimestral";
}

export const KIT_PRICE = 9.9;
export const KIT_LABEL = "Kit Pregue com Segurança";

// Mantido por compatibilidade — providers/asaas/checkouts.ts (cartão,
// fluxo dormant, fora deste lançamento) e qualquer código legado que
// ainda importe PRO_PRICE direto continuam funcionando sem alteração
// nenhuma: é sempre o preço do Mensal.
export const PRO_PRICE = PLANS.mensal.price;
