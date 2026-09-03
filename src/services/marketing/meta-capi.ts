import "server-only";
import { createHash } from "crypto";

// Conversions API do Meta (Facebook/Instagram Ads) — server-side de
// propósito: no PIX a pessoa costuma sair do site pra pagar pelo app
// do banco e pode nunca voltar pra uma página de "obrigado", então um
// pixel só no navegador perderia a maioria das vendas. Mandando daqui
// (do webhook, quando o pagamento realmente confirma), toda venda de
// verdade é contabilizada, com fbc/fbp/e-mail (quando disponíveis) pra
// a Meta linkar de volta no clique do anúncio/criativo exato.
const GRAPH_API_VERSION = "v21.0";

function hashForMeta(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type PurchaseEventInput = {
  value: number;
  eventId: string; // id da compra — dedup natural se o webhook repetir.
  email?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  // IP e user-agent de quem comprou (capturados na hora da compra, não
  // aqui — o webhook não tem esse dado, ver purchase.ts) — os dois
  // parâmetros que a própria Meta mais recomenda pra qualidade de
  // correspondência, junto com fbc/fbp/e-mail.
  clientIp?: string | null;
  clientUserAgent?: string | null;
};

// Nunca lança — falha de tracking não pode derrubar o webhook que
// libera acesso do cliente. Sem META_PIXEL_ID/META_CAPI_ACCESS_TOKEN
// configurados, só loga e sai (integração desligada, não quebrada).
export async function sendPurchaseEvent(input: PurchaseEventInput): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  try {
    const userData: Record<string, unknown> = {};
    if (input.email) userData.em = [hashForMeta(input.email)];
    if (input.fbc) userData.fbc = input.fbc;
    if (input.fbp) userData.fbp = input.fbp;
    // client_ip_address/client_user_agent NUNCA são hasheados (a Meta
    // pede em texto puro, diferente de em/ph) — são os dois campos que
    // eles mais recomendam, mesmo sem fbc.
    if (input.clientIp) userData.client_ip_address = input.clientIp;
    if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: input.eventId,
              action_source: "website",
              user_data: userData,
              custom_data: {
                currency: "BRL",
                value: input.value,
              },
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`[META-CAPI] falha ao enviar Purchase (status=${response.status}): ${text}`);
    }
  } catch (error) {
    console.error("[META-CAPI] falha ao enviar Purchase:", error);
  }
}
