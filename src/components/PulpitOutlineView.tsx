import type { PulpitOutlineContent } from "@/services/ai";

type PulpitOutlineViewProps = {
  outline: PulpitOutlineContent;
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

export function PulpitOutlineView({ outline }: PulpitOutlineViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {outline.tema}
        </h1>
        <p className="text-sm text-muted">
          {outline.texto_base} · {outline.ideia_central}
        </p>
      </header>

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Introdução
        </h2>
        <BulletList items={outline.introducao} />
      </section>

      {outline.pontos.map((ponto, index) => (
        <section
          key={index}
          className="flex flex-col gap-2 rounded-2xl border border-card-border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Ponto {index + 1}: {ponto.titulo}
          </h2>
          <p className="text-sm text-muted">{ponto.texto_relacionado}</p>
          <BulletList items={ponto.bullets} />
          <p className="rounded-xl bg-primary-soft px-3 py-2 font-semibold text-primary">
            &ldquo;{ponto.frase_impacto}&rdquo;
          </p>
        </section>
      ))}

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Aplicação Final
        </h2>
        <BulletList items={outline.aplicacao_final} />
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-primary bg-primary-soft p-4">
        <p className="font-semibold text-foreground">Apelo: {outline.apelo}</p>
        <p className="text-foreground">Oração: {outline.oracao}</p>
      </section>
    </div>
  );
}
