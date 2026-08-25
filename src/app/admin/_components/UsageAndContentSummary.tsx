import type { SubscriberDetail } from "@/services/admin";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export function UsageAndContentSummary({ detail }: { detail: SubscriberDetail }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Uso e conteúdo</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted">Gerações no total</span>
          <span className="text-lg font-bold text-foreground">{detail.generation_count}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Última geração</span>
          <span className="text-sm font-semibold text-foreground">{formatDateTime(detail.last_generation_at)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Conteúdos salvos</span>
          <span className="text-lg font-bold text-foreground">{detail.saved_content_count}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Academia (aulas)</span>
          <span className="text-sm font-semibold text-foreground">
            {detail.course_progress_summary.lessons_completed} concluídas de{" "}
            {detail.course_progress_summary.lessons_started} iniciadas
          </span>
        </div>
      </div>
    </section>
  );
}
