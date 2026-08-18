import "server-only";
import { PreApproval } from "mercadopago";
import { getMercadoPagoConfig } from "./client";

export type CreateCheckoutParams = {
  userId: string;
  email: string;
};

// Cria a assinatura vinculada ao plano já configurado no Mercado Pago,
// SEM card_token_id — isso faz a MP devolver "pending" + init_point
// (fluxo de checkout hospedado, nosso servidor nunca vê dados de
// cartão). external_reference é o user_id autenticado, nunca um valor
// vindo do navegador.
export async function createSubscriptionCheckout({
  userId,
  email,
}: CreateCheckoutParams): Promise<string> {
  const planId = process.env.MERCADOPAGO_PLAN_ID;
  const appUrl = process.env.APP_URL;

  if (!planId) {
    throw new Error("Mercado Pago não configurado: defina MERCADOPAGO_PLAN_ID em .env.local");
  }
  if (!appUrl) {
    throw new Error("Mercado Pago não configurado: defina APP_URL em .env.local");
  }

  const preApproval = new PreApproval(getMercadoPagoConfig());
  const result = await preApproval.create({
    body: {
      preapproval_plan_id: planId,
      external_reference: userId,
      payer_email: email,
      back_url: `${appUrl}/planos/retorno`,
    },
  });

  if (!result.init_point) {
    throw new Error("Mercado Pago não retornou o link de checkout.");
  }

  return result.init_point;
}

// Estado atual e autoritativo de uma assinatura — sempre buscado na
// API da MP, nunca confiado a partir do corpo de um webhook.
export async function getPreapproval(preapprovalId: string) {
  const preApproval = new PreApproval(getMercadoPagoConfig());
  return preApproval.get({ id: preapprovalId });
}
