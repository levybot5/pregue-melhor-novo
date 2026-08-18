import "server-only";
import { asaasRequest } from "./client";

// https://docs.asaas.com/reference/retrieve-a-single-subscription
// Buscado sempre que um webhook de pagamento/assinatura chega, para
// saber o estado real (nextDueDate vira o novo current_period_end) —
// nunca confiamos no corpo da notificação sozinho.
export type AsaasSubscription = {
  id: string;
  status: string;
  cycle: string;
  nextDueDate: string;
  customer: string;
  externalReference: string | null;
};

export async function getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>("GET", `/subscriptions/${subscriptionId}`);
}
