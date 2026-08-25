import type { OverviewStats } from "@/services/admin";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-card-border bg-card p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}

export function OverviewCards({ stats }: { stats: OverviewStats }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card label="Assinantes ativos" value={stats.active_subscribers} />
      <Card label="Novos este mês" value={stats.new_this_month} />
      <Card label="Cancelados este mês" value={stats.cancelled_this_month} />
      <Card label="Inadimplentes" value={stats.past_due_count} />
      <Card label="Pix vencido s/ renovar" value={stats.expired_unrenewed_count} />
      <Card label="MRR" value={formatCurrency(stats.mrr)} />
      <Card label="Receita do mês" value={formatCurrency(stats.revenue_this_month)} />
      <Card label="Pix ativos" value={stats.pix_active_count} />
      <Card label="Cartão ativos" value={stats.card_active_count} />
    </section>
  );
}
