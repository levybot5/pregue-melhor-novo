// Mapeamento oficial (ver relatório desta etapa) — nunca inventamos um
// nome de evento ou status que a Asaas não documenta.
//
// PIX (cobrança avulsa via /payments):
//   PAYMENT_RECEIVED  -> libera acesso (documentação da Asaas é
//                        explícita: PAYMENT_CONFIRMED significa "pago,
//                        mas o dinheiro ainda não está disponível";
//                        PAYMENT_RECEIVED é quando o valor realmente
//                        cai na conta — só aí confirmamos o PIX).
//   PAYMENT_OVERDUE / PAYMENT_DELETED / PAYMENT_REFUNDED -> nunca paga
//                        (cobrança não confirmada continua "pending").
//
// CARTÃO (assinatura recorrente via /checkouts + /subscriptions):
//   PAYMENT_CONFIRMED -> ativa/renova o período (aprovação do cartão
//                        já é o sinal correto aqui — diferente do PIX,
//                        não faz sentido esperar liquidação bancária
//                        pra liberar uma assinatura recorrente).
//   SUBSCRIPTION_INACTIVATED / SUBSCRIPTION_DELETED -> cancela.

export const PIX_RELEASE_EVENT = "PAYMENT_RECEIVED";
export const CARD_RELEASE_EVENT = "PAYMENT_CONFIRMED";
export const SUBSCRIPTION_CANCEL_EVENTS = ["SUBSCRIPTION_INACTIVATED", "SUBSCRIPTION_DELETED"];
export const PAYMENT_REFUND_EVENTS = ["PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED"];
