import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

export const RESEND_FROM = "Pregue Melhor <naoresponda@preguemelhorapp.site>";

export function getResendClient(): Resend {
  if (client) return client;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend não configurado: defina RESEND_API_KEY em .env.local");
  }

  client = new Resend(apiKey);
  return client;
}
