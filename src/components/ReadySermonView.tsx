import type { ReadySermon } from "@/services/database";

type ReadySermonViewProps = {
  sermon: ReadySermon;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-card-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
        {title}
      </h2>
      <div className="text-base leading-relaxed text-foreground">
        {children}
      </div>
    </section>
  );
}

export function ReadySermonView({ sermon }: ReadySermonViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {sermon.title}
        </h1>
        <p className="text-sm text-muted">
          {sermon.base_text} · {sermon.short_description}
        </p>
      </header>

      <Section title="Introdução">{sermon.introduction}</Section>

      {sermon.points.map((ponto, index) => (
        <Section key={index} title={`Ponto ${index + 1}: ${ponto.title}`}>
          <p>{ponto.text}</p>
          {ponto.items && ponto.items.length > 0 && (
            <ul className="mt-2 ml-4 list-disc text-sm text-muted">
              {ponto.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          )}
        </Section>
      ))}

      <Section title="Aplicação">{sermon.application}</Section>
      <Section title="Conclusão">{sermon.conclusion}</Section>
      {sermon.appeal && <Section title="Apelo">{sermon.appeal}</Section>}
      {sermon.prayer && <Section title="Oração">{sermon.prayer}</Section>}
    </div>
  );
}
