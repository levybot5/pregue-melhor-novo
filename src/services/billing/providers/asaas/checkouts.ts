import "server-only";
import { asaasRequest } from "./client";

// https://docs.asaas.com/reference/create-new-checkout — checkout
// HOSPEDADO da Asaas: a pessoa sai do nosso site, escolhe Pix ou
// Cartão e paga numa página da própria Asaas (nosso servidor nunca vê
// número de cartão). chargeTypes ["DETACHED"] = cobrança ÚNICA, nunca
// assinatura recorrente — nosso modelo é sempre "paga uma vez, libera
// N dias" (Trimestral/Anual), igual ao Pix direto (./payments.ts), só
// que aqui a Asaas escolhe/coleta os dados em vez do nosso formulário.
export type CreateHostedCheckoutInput = {
  value: number;
  description: string;
  externalReference: string;
  successUrl: string;
  cancelUrl: string;
  expiredUrl: string;
};

export type AsaasCheckout = {
  id: string;
  link: string;
  status: string;
};

export async function createHostedCheckout(
  input: CreateHostedCheckoutInput,
): Promise<AsaasCheckout> {
  return asaasRequest<AsaasCheckout>("POST", "/checkouts", {
    billingTypes: ["PIX", "CREDIT_CARD"],
    chargeTypes: ["DETACHED"],
    minutesToExpire: 60,
    externalReference: input.externalReference,
    callback: {
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      expiredUrl: input.expiredUrl,
    },
    items: [
      {
        name: "Pregue Melhor Pro",
        description: input.description,
        quantity: 1,
        value: input.value,
      },
    ],
  });
}
