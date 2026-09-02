import { NextResponse, type NextRequest } from "next/server";
import {
  validateAsaasWebhookToken,
  InvalidAsaasWebhookTokenError,
  type AsaasWebhookPayload,
} from "@/services/billing/providers/asaas";
import {
  syncPixPaymentReceived,
  syncHostedCheckoutPaymentReceived,
  syncCardPaymentConfirmed,
  syncSubscriptionCancelled,
  syncCardPaymentOverdue,
  syncPaymentRefunded,
} from "@/services/billing/asaas-webhook-sync";
import { SUBSCRIPTION_CANCEL_EVENTS, PAYMENT_REFUND_EVENTS } from "@/services/billing/providers/asaas";

// Endpoint dedicado para notificações da Asaas. A Asaas não assina o
// corpo (diferente do Mercado Pago) — a autenticidade vem do header
// fixo "asaas-access-token", configurado no painel. Nunca confiamos no
// corpo por si só para decidir estado: cada handler rebusca o
// pagamento/assinatura real na API antes de gravar qualquer coisa.
export async function POST(request: NextRequest) {
  const token = request.headers.get("asaas-access-token");

  try {
    validateAsaasWebhookToken(token);
  } catch (error) {
    if (error instanceof InvalidAsaasWebhookTokenError) {
      console.error("[ASAAS-WEBHOOK] token inválido ou ausente");
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }
    throw error;
  }

  const body = (await request.json().catch(() => null)) as AsaasWebhookPayload | null;
  if (!body?.event) {
    return NextResponse.json({ error: "missing event" }, { status: 400 });
  }

  // Log sem dado sensível: só o tipo do evento e os ids envolvidos,
  // nunca token, nem dado de cliente.
  console.log(`[ASAAS-WEBHOOK] event=${body.event} payment=${body.payment?.id ?? "-"} subscription=${body.subscription?.id ?? "-"}`);

  try {
    switch (body.event) {
      case "PAYMENT_RECEIVED":
        // Pix direto (nosso formulário) e Pix do checkout hospedado
        // chegam pelo mesmo evento — cada handler só age se o próprio
        // critério de casamento bater (ver comentário em cada um).
        if (body.payment?.id) {
          await syncPixPaymentReceived(body.payment.id);
          await syncHostedCheckoutPaymentReceived(body.payment.id);
        }
        break;
      case "PAYMENT_CONFIRMED":
        // Idem, mas cartão: assinatura recorrente antiga (sem uso hoje)
        // e cartão do checkout hospedado (cobrança única).
        if (body.payment?.id) {
          await syncCardPaymentConfirmed(body.payment.id);
          await syncHostedCheckoutPaymentReceived(body.payment.id);
        }
        break;
      case "PAYMENT_OVERDUE":
        if (body.payment?.id) await syncCardPaymentOverdue(body.payment.id);
        break;
      default:
        if (PAYMENT_REFUND_EVENTS.includes(body.event) && body.payment?.id) {
          await syncPaymentRefunded(body.payment.id);
        } else if (SUBSCRIPTION_CANCEL_EVENTS.includes(body.event) && body.subscription?.id) {
          await syncSubscriptionCancelled(body.subscription.id);
        }
      // Outros eventos (PAYMENT_CREATED, PAYMENT_UPDATED, etc.) são
      // reconhecidos e ignorados — não afetam liberação de acesso.
    }
  } catch (error) {
    console.error(`[ASAAS-WEBHOOK] falha ao processar event=${body.event}:`, error);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
