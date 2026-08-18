import { NextResponse, type NextRequest } from "next/server";
import {
  validateWebhookSignature,
  InvalidWebhookSignatureError,
} from "@/services/billing/providers/mercadopago";
import {
  syncSubscriptionFromPreapproval,
  syncPastDueFromRejectedPayment,
} from "@/services/billing/subscription-sync";

// Endpoint dedicado para notificações da Mercado Pago. Nunca confia no
// corpo da notificação por si só: a assinatura (x-signature) é
// validada primeiro, e o estado real é sempre buscado de volta na API
// da MP antes de qualquer escrita no banco.
export async function POST(request: NextRequest) {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const dataId = request.nextUrl.searchParams.get("data.id");

  try {
    validateWebhookSignature({ xSignature, xRequestId, dataId });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.error(
        `[MP-WEBHOOK] assinatura inválida: reason=${error.reason} request_id=${xRequestId ?? "?"}`,
      );
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    throw error;
  }

  if (!dataId) {
    return NextResponse.json({ error: "missing data.id" }, { status: 400 });
  }

  // O tipo do evento normalmente vem na query string, mas caímos para
  // o corpo se não vier — a assinatura já foi validada, então é
  // seguro ler o JSON agora.
  let type = request.nextUrl.searchParams.get("type");
  if (!type) {
    const body: unknown = await request.json().catch(() => null);
    if (body && typeof body === "object" && "type" in body) {
      const bodyType = (body as { type?: unknown }).type;
      type = typeof bodyType === "string" ? bodyType : null;
    }
  }

  try {
    if (type === "subscription_preapproval") {
      await syncSubscriptionFromPreapproval(dataId);
    } else if (type === "subscription_authorized_payment") {
      await syncPastDueFromRejectedPayment(dataId);
    }
    // Outros tópicos (ex.: subscription_preapproval_plan) são
    // reconhecidos e ignorados — não gerenciamos múltiplos planos.
  } catch (error) {
    console.error(`[MP-WEBHOOK] falha ao processar type=${type} data.id=${dataId}:`, error);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
