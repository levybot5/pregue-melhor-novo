import type { SubscriberDetail } from "@/services/admin";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  past_due: "Inadimplente",
  cancelled: "Cancelado",
  inactive: "Inativo",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-card-border py-2 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function SubscriberDetailCard({ detail }: { detail: SubscriberDetail }) {
  return (
    <section className="flex flex-col rounded-2xl border border-card-border bg-card p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Assinatura</h2>
      <Row label="E-mail" value={detail.email} />
      <Row label="ID do usuário" value={detail.user_id} />
      <Row label="Status" value={STATUS_LABELS[detail.status] ?? detail.status} />
      <Row label="Método de pagamento" value={detail.payment_method === "pix" ? "Pix" : detail.payment_method === "credit_card" ? "Cartão" : "—"} />
      <Row label="Provedor" value={detail.provider ?? "—"} />
      <Row label="ID da assinatura (provedor)" value={detail.provider_subscription_id_masked ?? "—"} />
      <Row label="Cadastro na conta" value={formatDateTime(detail.signup_date)} />
      <Row label="Entrou no Pro" value={formatDateTime(detail.entry_date)} />
      <Row label="Período atual" value={formatDateTime(detail.current_period_start)} />
      <Row label="Vence em" value={formatDateTime(detail.current_period_end)} />
    </section>
  );
}
