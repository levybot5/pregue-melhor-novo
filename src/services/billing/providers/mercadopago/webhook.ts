import "server-only";
import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
  Payment,
} from "mercadopago";
import { getMercadoPagoConfig } from "./client";

export { InvalidWebhookSignatureError };

export type WebhookSignatureInput = {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
};

// Valida a autenticidade usando o mecanismo oficial (HMAC via
// x-signature, comparação em tempo constante, embutido no SDK). Lança
// InvalidWebhookSignatureError se algo não bater — o chamador NUNCA
// deve processar o corpo da notificação sem essa validação passar.
export function validateWebhookSignature(input: WebhookSignatureInput): void {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Mercado Pago não configurado: defina MERCADOPAGO_WEBHOOK_SECRET em .env.local",
    );
  }

  WebhookSignatureValidator.validate({
    xSignature: input.xSignature,
    xRequestId: input.xRequestId,
    dataId: input.dataId,
    secret,
    toleranceSeconds: 300,
  });
}

// Usado só no evento secundário subscription_authorized_payment, para
// detectar cobrança recusada. Retorna null em vez de lançar se o
// pagamento não puder ser lido — esse evento é best-effort, o
// subscription_preapproval é a fonte de verdade principal.
export async function fetchPaymentSafely(paymentId: string) {
  try {
    const payment = new Payment(getMercadoPagoConfig());
    return await payment.get({ id: paymentId });
  } catch (error) {
    console.error("Falha ao buscar payment do Mercado Pago:", error);
    return null;
  }
}
