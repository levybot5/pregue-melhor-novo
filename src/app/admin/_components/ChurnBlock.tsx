import type { ChurnStats } from "@/services/admin";

function formatPct(value: number | null): string {
  return value === null ? "sem dados suficientes" : `${value}%`;
}

export function ChurnBlock({ stats }: { stats: ChurnStats }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Churn</h2>
      <p className="text-xs text-muted">
        Churn = clientes perdidos no período ÷ clientes ativos no início do período.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted">Últimos 30 dias</span>
          <span className="text-lg font-bold text-foreground">{formatPct(stats.churn_last_30_days_pct)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Mês atual</span>
          <span className="text-lg font-bold text-foreground">{formatPct(stats.churn_this_month_pct)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Motivo (últimos 30 dias)</span>
        <ul className="flex flex-col gap-1 text-sm text-foreground">
          <li>Cancelamento voluntário: {stats.breakdown_last_30_days.voluntary_cancel}</li>
          <li>Cartão inadimplente: {stats.breakdown_last_30_days.card_past_due}</li>
          <li>Pix vencido sem renovar: {stats.breakdown_last_30_days.pix_non_renewal}</li>
          <li>Estorno: {stats.breakdown_last_30_days.refunded}</li>
        </ul>
      </div>

      <p className="text-xs text-muted">{stats.note}</p>
    </section>
  );
}
