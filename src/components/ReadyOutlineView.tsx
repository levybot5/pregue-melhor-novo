import type { ReadyOutline } from "@/services/database";

type ReadyOutlineViewProps = {
  outline: ReadyOutline;
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="ml-4 list-disc text-base text-foreground">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function ReadyOutlineView({ outline }: ReadyOutlineViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {outline.title}
        </h1>
        <p className="text-sm text-muted">
          {outline.base_text} · {outline.central_idea}
        </p>
      </header>

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Introdução
        </h2>
        <p className="text-base text-foreground">{outline.short_introduction}</p>
      </section>

      {outline.points.map((ponto, index) => (
        <section
          key={index}
          className="flex flex-col gap-2 rounded-2xl border border-card-border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Ponto {index + 1}: {ponto.title}
          </h2>
          <BulletList items={ponto.bullets} />
        </section>
      ))}

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Aplicações
        </h2>
        <BulletList items={outline.applications} />
      </section>

      {outline.conclusion_appeal && (
        <section className="flex flex-col gap-2 rounded-2xl border border-primary bg-primary-soft p-4">
          <p className="font-semibold text-foreground">{outline.conclusion_appeal}</p>
        </section>
      )}
    </div>
  );
}
