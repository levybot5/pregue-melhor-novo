import type { BibleStudyContent } from "@/services/ai";

type BibleStudyViewProps = {
  study: BibleStudyContent;
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
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

export function BibleStudyView({ study }: BibleStudyViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {study.titulo}
        </h1>
        <p className="text-sm text-muted">
          {study.passagem} · {study.verdade_principal}
        </p>
      </header>

      <Section title="Contexto Bíblico">{study.contexto_biblico}</Section>
      <Section title="Explicação do Texto">{study.explicacao_texto}</Section>

      {study.palavra_original && (
        <section className="flex flex-col gap-1 rounded-2xl border border-primary bg-primary-soft p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Palavra no Original: {study.palavra_original.palavra}
          </h2>
          <p className="text-base leading-relaxed text-foreground">
            {study.palavra_original.significado}
          </p>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Conexões Bíblicas
        </h2>
        {study.conexoes_biblicas.map((conexao, index) => (
          <div key={index}>
            <p className="font-semibold text-foreground">{conexao.referencia}</p>
            <p className="text-sm text-muted">{conexao.explicacao}</p>
          </div>
        ))}
      </section>

      <Section title="Aplicação para a Vida Cristã">
        {study.aplicacao_vida_crista}
      </Section>
      <Section title="Cuidado de Interpretação">{study.cuidado_interpretacao}</Section>
      <Section title="Resumo Final">{study.resumo_final}</Section>
    </div>
  );
}
