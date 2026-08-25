import type { Trends } from "@/services/admin";

// SVG inline simples, sem lib de gráfico nova — barras de ganhos (verde)
// e perdas (vermelho) por mês, a partir de subscription_events.
export function TrendChart({ trends }: { trends: Trends }) {
  const months = trends.monthly_net;
  const maxValue = Math.max(1, ...months.map((m) => Math.max(m.gained, m.lost)));
  const barWidth = 24;
  const gap = 12;
  const chartHeight = 120;
  const width = months.length * (barWidth * 2 + gap);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
        Ganhos x cancelados por mês
      </h2>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${chartHeight + 20}`} width={width} height={chartHeight + 20}>
          {months.map((month, i) => {
            const x = i * (barWidth * 2 + gap);
            const gainedHeight = (month.gained / maxValue) * chartHeight;
            const lostHeight = (month.lost / maxValue) * chartHeight;
            return (
              <g key={month.month}>
                <rect
                  x={x}
                  y={chartHeight - gainedHeight}
                  width={barWidth}
                  height={gainedHeight}
                  fill="currentColor"
                  rx={2}
                  className="text-primary"
                />
                <rect
                  x={x + barWidth}
                  y={chartHeight - lostHeight}
                  width={barWidth}
                  height={lostHeight}
                  fill="#c0362c"
                  rx={2}
                />
                <text
                  x={x + barWidth}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="currentColor"
                  className="text-muted"
                >
                  {month.month.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Ganhos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#c0362c" }} /> Cancelados
        </span>
      </div>

      <p className="text-xs text-muted">{trends.note}</p>
    </section>
  );
}
