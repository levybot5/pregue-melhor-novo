import type { PaymentHistoryEntry } from "@/services/admin";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  expired: "Expirado",
  cancelled: "Cancelado",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PaymentHistoryTable({ history }: { history: PaymentHistoryEntry[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Histórico de pagamento</h2>
      {history.length === 0 ? (
        <p className="text-sm text-muted">Nenhum pagamento registrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-card-border text-xs uppercase text-muted">
                <th className="py-2 pr-3">Valor</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Método</th>
                <th className="py-2 pr-3">Pago em</th>
                <th className="py-2">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-card-border last:border-0">
                  <td className="py-2 pr-3 font-medium text-foreground">{formatCurrency(entry.amount)}</td>
                  <td className="py-2 pr-3 text-foreground">{STATUS_LABELS[entry.status] ?? entry.status}</td>
                  <td className="py-2 pr-3 text-foreground">{entry.payment_method === "pix" ? "Pix" : "Cartão"}</td>
                  <td className="py-2 pr-3 text-foreground">{formatDateTime(entry.paid_at)}</td>
                  <td className="py-2 text-foreground">{formatDateTime(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
