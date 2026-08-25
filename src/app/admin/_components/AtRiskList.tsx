import type { AtRiskSignal, AtRiskSubscriber } from "@/services/admin";

const SIGNAL_LABELS: Record<AtRiskSignal, string> = {
  inactive_14d: "Sem gerar há 14+ dias",
  pix_expiring_soon: "Pix vencendo em breve",
  pix_expired_unrenewed: "Pix vencido sem renovar",
  card_past_due: "Cartão recusado",
  signed_up_never_generated: "Nunca gerou conteúdo",
};

export function AtRiskList({ subscribers }: { subscribers: AtRiskSubscriber[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Possível risco de churn
        </h2>
        <p className="text-xs text-muted">
          São sinais operacionais, não uma certeza de que a pessoa vai cancelar.
        </p>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-sm text-muted">Nenhum sinal de risco no momento.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {subscribers.map((sub) => (
            <li
              key={`${sub.user_id}-${sub.signal}`}
              className="flex flex-col gap-0.5 rounded-xl border border-card-border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium text-foreground">{sub.email}</span>
              <span className="text-muted">
                {SIGNAL_LABELS[sub.signal]} — {sub.detail}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
