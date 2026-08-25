import "server-only";
import { asaasRequest } from "./client";
import { PRO_PRICE } from "../../pricing";

// https://docs.asaas.com/reference/create-new-checkout — checkout
// HOSPEDADO da Asaas, só para cartão. Nosso servidor nunca vê número
// de cartão, CVV nem dados sensíveis — o cliente digita tudo na
// página da própria Asaas. chargeTypes: ["RECURRENT"] faz a Asaas
// criar uma assinatura mensal de verdade (recorrência oficial, nunca
// uma cobrança avulsa disfarçada).
//
// PIX NÃO usa mais este checkout — pede endereço/celular além de
// nome/CPF, fricção demais para uma cobrança de R$10 (decisão do
// produto). PIX usa cobrança direta (ver ./payments.ts), que só exige
// nome + CPF.
export type CreateCardCheckoutInput = {
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

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createCardCheckout(
  input: CreateCardCheckoutInput,
): Promise<AsaasCheckout> {
  return asaasRequest<AsaasCheckout>("POST", "/checkouts", {
    billingTypes: ["CREDIT_CARD"],
    chargeTypes: ["RECURRENT"],
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
        description: "Assinatura mensal",
        quantity: 1,
        value: PRO_PRICE,
      },
    ],
    subscription: {
      cycle: "MONTHLY",
      // Obrigatório pra Asaas ("O campo nextDueDate deve ser
      // informado") — primeira cobrança já no dia da assinatura.
      nextDueDate: todayIsoDate(),
    },
  });
}
