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

// "anual" continua aqui só por compatibilidade com assinaturas antigas
// já gravadas (subscriptions.plan) — zero vendas reais em todo o
// histórico (Anual nunca converteu, mesmo ao vivo lado a lado com o
// Trimestral), então saiu de circulação: /planos e a oferta voltam a
// vender Mensal + Trimestral. Removê-lo do tipo quebraria a leitura de
// quem porventura já tenha essa assinatura.
export type PlanId = "mensal" | "trimestral" | "anual";

export type Plan = {
  id: PlanId;
  label: string;
  price: number; // reais
  days: number; // duração do acesso, em dias
};

export const PLANS: Record<PlanId, Plan> = {
  mensal: { id: "mensal", label: "Mensal", price: 10, days: 30 },
  trimestral: { id: "trimestral", label: "Trimestral", price: 22.9, days: 90 },
  anual: { id: "anual", label: "Anual", price: 59.9, days: 365 },
};

export const DEFAULT_PLAN_ID: PlanId = "trimestral";

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "mensal" || value === "trimestral" || value === "anual";
}

export const KIT_PRICE = 9.9;
export const KIT_LABEL = "Kit Pregue com Segurança";

// Ebook avulso "Apocalipse Simplificado" — order bump em /planos/pagar
// e compra independente dentro da Academia (ver services/billing/ebook.ts
// pro grant/revoke de acesso, que É server-only, diferente daqui).
export const EBOOK_PRODUCT_ID = "apocalipse-simplificado";
export const EBOOK_PRICE = 12.9;
export const EBOOK_LABEL = "Apocalipse Simplificado";

// Mantido por compatibilidade — providers/asaas/checkouts.ts (cartão,
// fluxo dormant, fora deste lançamento) e qualquer código legado que
// ainda importe PRO_PRICE direto continuam funcionando sem alteração
// nenhuma: é sempre o preço do Mensal.
export const PRO_PRICE = PLANS.mensal.price;
