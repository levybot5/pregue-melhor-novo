import type { SubscriptionStatus } from "../../subscription";

// Mapeamento oficial (documentado no relatório da Etapa 7):
//
// MP preapproval.status  -> nosso subscriptions.status
// ----------------------------------------------------
// "authorized"           -> active      (cobrança em dia, acesso liberado)
// "paused"               -> inactive    (assinatura pausada na MP)
// "cancelled"             -> cancelled   (assinatura cancelada)
// "pending"               -> inactive    (ainda não autorizada pelo pagador)
// qualquer outro valor    -> inactive    (nunca inventamos um status novo)
//
// "past_due" não vem do preapproval — é derivado à parte, quando um
// pagamento recorrente (subscription_authorized_payment) é rejeitado
// enquanto a assinatura ainda não foi cancelada pela MP.
export function mapPreapprovalStatus(mpStatus: string | undefined | null): SubscriptionStatus {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "inactive";
    case "cancelled":
      return "cancelled";
    case "pending":
    default:
      return "inactive";
  }
}
