import Link from "next/link";
import type { SubscriberListRow } from "@/services/admin";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  past_due: "Inadimplente",
  cancelled: "Cancelado",
  inactive: "Inativo",
};

const METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function SubscriberTable({
  rows,
  page,
  pageSize,
  totalCount,
  buildPageHref,
}: {
  rows: SubscriberListRow[];
  page: number;
  pageSize: number;
  totalCount: number;
  buildPageHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-card-border text-xs uppercase text-muted">
              <th className="py-2 pr-3">E-mail</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Método</th>
              <th className="py-2 pr-3">Entrou em</th>
              <th className="py-2 pr-3">Último pagamento</th>
              <th className="py-2 pr-3">Vence em</th>
              <th className="py-2 pr-3">Dias como assinante</th>
              <th className="py-2">Gerações no período</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-muted">
                  Nenhum assinante encontrado com esses filtros.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.user_id} className="border-b border-card-border last:border-0">
                  <td className="py-2 pr-3">
                    <Link
                      href={`/admin/assinantes/${row.user_id}`}
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      {row.email}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-foreground">{STATUS_LABELS[row.status] ?? row.status}</td>
                  <td className="py-2 pr-3 text-foreground">{METHOD_LABELS[row.payment_method] ?? "—"}</td>
                  <td className="py-2 pr-3 text-foreground">{formatDate(row.entry_date)}</td>
                  <td className="py-2 pr-3 text-foreground">{formatDate(row.last_payment_at)}</td>
                  <td className="py-2 pr-3 text-foreground">{formatDate(row.current_period_end)}</td>
                  <td className="py-2 pr-3 text-foreground">{row.days_as_subscriber}</td>
                  <td className="py-2 text-foreground">{row.generation_count_current_period}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Página {page} de {totalPages} — {totalCount} assinantes
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildPageHref(page - 1)} className="font-semibold text-primary underline underline-offset-4">
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildPageHref(page + 1)} className="font-semibold text-primary underline underline-offset-4">
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
