import "server-only";
import { asaasRequest } from "./client";

export type AsaasPayment = {
  id: string;
  status: string;
  value: number;
  billingType: string;
  customer: string;
  externalReference: string | null;
  subscription?: string | null;
  dueDate: string;
};

// https://docs.asaas.com/reference/create-new-payment — cobrança PIX
// AVULSA (billingType "PIX"), nunca "Pix Automático" (produto
// diferente, com autorização de recorrência — ver item 21 do pedido).
// dueDate = hoje: a cobrança fica "PENDING" até o pagamento.
export type CreatePixPaymentInput = {
  customerId: string;
  value: number;
  externalReference: string;
  description?: string;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createPixPayment(input: CreatePixPaymentInput): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>("POST", "/payments", {
    customer: input.customerId,
    billingType: "PIX",
    value: input.value,
    dueDate: todayIsoDate(),
    description: input.description,
    externalReference: input.externalReference,
  });
}

// https://docs.asaas.com/reference/get-qr-code-for-pix-payments
export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasRequest<AsaasPixQrCode>("GET", `/payments/${paymentId}/pixQrCode`);
}

// Estado autoritativo de um pagamento — sempre buscado de volta na API
// da Asaas antes de gravar algo no banco a partir de um webhook, nunca
// confiado a partir só do corpo da notificação (mesma regra já usada
// para o Mercado Pago).
export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>("GET", `/payments/${paymentId}`);
}
