import type { UsageStats } from "@/services/admin";

const BUCKET_LABELS: Record<keyof UsageStats["distribution_30_days"], string> = {
  zero: "0 gerações",
  one_to_five: "1–5",
  six_to_twenty: "6–20",
  twentyone_to_fifty: "21–50",
  fifty_plus: "50+",
};

export function UsageBlock({ stats }: { stats: UsageStats }) {
  const buckets = Object.entries(stats.distribution_30_days) as [
    keyof UsageStats["distribution_30_days"],
    number,
  ][];
  const maxCount = Math.max(1, ...buckets.map(([, count]) => count));

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Uso</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted">Gerações (7d)</span>
          <span className="text-lg font-bold text-foreground">{stats.generations_last_7_days}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Gerações (30d)</span>
          <span className="text-lg font-bold text-foreground">{stats.generations_last_30_days}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Ativos (7d)</span>
          <span className="text-lg font-bold text-foreground">{stats.active_users_last_7_days}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Ativos (30d)</span>
          <span className="text-lg font-bold text-foreground">{stats.active_users_last_30_days}</span>
        </div>
      </div>

      <p className="text-sm text-muted">
        Média de {stats.avg_generations_per_subscriber_30_days} gerações por assinante nos últimos 30 dias.
      </p>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted">Distribuição (30 dias)</span>
        {buckets.map(([key, count]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-muted">{BUCKET_LABELS[key]}</span>
            <div className="h-4 flex-1 rounded-full bg-primary-soft">
              <div
                className="h-4 rounded-full bg-primary"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
