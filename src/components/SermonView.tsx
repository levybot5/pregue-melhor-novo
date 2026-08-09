import type { SermonContent } from "@/services/ai";

type SermonViewProps = {
  sermon: SermonContent;
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

export function SermonView({ sermon }: SermonViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {sermon.titulo}
        </h1>
        <p className="text-sm text-muted">
          {sermon.texto_base} · {sermon.tema_central}
        </p>
      </header>

      <Section title="Introdução">{sermon.introducao}</Section>
      <Section title="Contexto Bíblico">{sermon.contexto_biblico}</Section>

      {sermon.pontos.map((ponto, index) => (
        <Section key={index} title={`Ponto ${index + 1}: ${ponto.titulo}`}>
          <p>{ponto.explicacao}</p>
          <p className="mt-2 text-muted">{ponto.exemplo_aplicacao}</p>
        </Section>
      ))}

      <Section title="Aplicação Final">{sermon.aplicacao_final}</Section>
      <Section title="Conclusão">{sermon.conclusao}</Section>
      <Section title="Apelo">{sermon.apelo}</Section>
      <Section title="Oração Final">{sermon.oracao_final}</Section>

      <section className="flex flex-col gap-3 rounded-2xl border border-primary bg-primary-soft p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Esboço para o Púlpito
        </h2>
        <p className="text-sm text-muted">
          {sermon.esboco_pulpito.titulo} · {sermon.esboco_pulpito.texto_base}
        </p>
        <div className="flex flex-col gap-3">
          {sermon.esboco_pulpito.pontos.map((ponto, index) => (
            <div key={index}>
              <p className="font-semibold text-foreground">
                {index + 1}. {ponto.titulo}
              </p>
              <ul className="ml-4 list-disc text-sm text-foreground">
                {ponto.itens.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="font-semibold text-foreground">
          Apelo: {sermon.esboco_pulpito.apelo}
        </p>
      </section>
    </div>
  );
}
