import "server-only";
import { timingSafeEqual } from "node:crypto";

// https://docs.asaas.com/docs/receive-asaas-events-at-your-webhook-endpoint
// A Asaas não assina o corpo (ao contrário do Mercado Pago) — a
// autenticidade vem de um token fixo, configurado no painel da Asaas,
// que ela ecoa de volta no header "asaas-access-token" em toda
// notificação. Comparação em tempo constante para não vazar o token
// por diferença de tempo de resposta.
export class InvalidAsaasWebhookTokenError extends Error {
  constructor() {
    super("Token do webhook Asaas inválido ou ausente.");
    this.name = "InvalidAsaasWebhookTokenError";
  }
}

export function validateAsaasWebhookToken(receivedToken: string | null): void {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expectedToken) {
    throw new Error("Asaas não configurado: defina ASAAS_WEBHOOK_TOKEN em .env.local");
  }
  if (!receivedToken) {
    throw new InvalidAsaasWebhookTokenError();
  }

  const expected = Buffer.from(expectedToken);
  const received = Buffer.from(receivedToken);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new InvalidAsaasWebhookTokenError();
  }
}

// Payload mínimo que todo evento de cobrança/assinatura compartilha —
// ver https://docs.asaas.com/docs/receive-asaas-events-at-your-webhook-endpoint.
// Nunca usamos os campos aninhados (payment/subscription) do corpo
// para decidir estado: só o id, pra buscar de volta na API.
export type AsaasWebhookPayload = {
  id: string;
  event: string;
  payment?: { id: string };
  subscription?: { id: string };
};
