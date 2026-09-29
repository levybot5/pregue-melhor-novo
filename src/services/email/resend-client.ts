import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

// "contato@" em vez de "naoresponda@" de propósito — domínio novo,
// sem histórico de envio ainda: um remetente "no-reply" pesa contra a
// reputação em alguns filtros de spam, e "contato" soa menos
// automatizado (ver achado real: primeiros e-mails caindo em spam).
export const RESEND_FROM = "Pregue Melhor <contato@preguemelhorapp.site>";
export const RESEND_REPLY_TO = "contato@preguemelhorapp.site";

export function getResendClient(): Resend {
  if (client) return client;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend não configurado: defina RESEND_API_KEY em .env.local");
  }

  client = new Resend(apiKey);
  return client;
}
