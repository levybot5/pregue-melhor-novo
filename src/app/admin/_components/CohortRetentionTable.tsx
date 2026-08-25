import type { CohortRow } from "@/services/admin";

function formatPct(value: number | null): string {
  return value === null ? "sem dados suficientes" : `${value}%`;
}

export function CohortRetentionTable({ cohorts }: { cohorts: CohortRow[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
        Retenção por coorte
      </h2>

      {cohorts.length === 0 ? (
        <p className="text-sm text-muted">
          Sem dados suficientes ainda — coortes só aparecem a partir de assinaturas ativadas
          depois desta atualização.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-card-border text-xs uppercase text-muted">
                <th className="py-2 pr-3">Mês de entrada</th>
                <th className="py-2 pr-3">Qtd. inicial</th>
                <th className="py-2 pr-3">30 dias</th>
                <th className="py-2 pr-3">60 dias</th>
                <th className="py-2">90 dias</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr key={cohort.cohort_month} className="border-b border-card-border last:border-0">
                  <td className="py-2 pr-3 font-medium text-foreground">{cohort.cohort_month}</td>
                  <td className="py-2 pr-3 text-foreground">{cohort.cohort_size}</td>
                  <td className="py-2 pr-3 text-foreground">{formatPct(cohort.retained_30_pct)}</td>
                  <td className="py-2 pr-3 text-foreground">{formatPct(cohort.retained_60_pct)}</td>
                  <td className="py-2 text-foreground">{formatPct(cohort.retained_90_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
