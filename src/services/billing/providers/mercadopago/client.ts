import "server-only";
import { MercadoPagoConfig } from "mercadopago";

// Único arquivo que constrói a config do SDK do Mercado Pago. O
// access token nunca é lido fora daqui dentro deste provider.
let config: MercadoPagoConfig | null = null;

export function getMercadoPagoConfig(): MercadoPagoConfig {
  if (config) return config;

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Mercado Pago não configurado: defina MERCADOPAGO_ACCESS_TOKEN em .env.local",
    );
  }

  config = new MercadoPagoConfig({ accessToken });
  return config;
}
