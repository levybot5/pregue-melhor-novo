// Único ponto de entrada do provider Mercado Pago. Nada fora de
// src/services/billing deve importar diretamente de ./client,
// ./subscription, ./webhook ou ./status-mapping — nem a UI, nem as
// ferramentas de IA. Trocar de gateway no futuro significa reescrever
// esta pasta, sem tocar no resto do app.

export { createSubscriptionCheckout, getPreapproval } from "./subscription";
export {
  validateWebhookSignature,
  fetchPaymentSafely,
  InvalidWebhookSignatureError,
} from "./webhook";
export { mapPreapprovalStatus } from "./status-mapping";
