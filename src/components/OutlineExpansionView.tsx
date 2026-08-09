import type { OutlineExpansionContent } from "@/services/ai";
import { normalizeOutlinePointTitle } from "@/lib/outline";

type OutlineExpansionViewProps = {
  content: OutlineExpansionContent;
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

export function OutlineExpansionView({ content }: OutlineExpansionViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {content.titulo}
        </h1>
        <p className="text-sm text-muted">
          {content.texto_base} · {content.ideia_central}
        </p>
      </header>

      <Section title="Introdução">{content.introducao}</Section>
      {content.contexto && <Section title="Contexto">{content.contexto}</Section>}

      {content.pontos.map((ponto, index) => (
        <Section
          key={index}
          title={`Ponto ${index + 1}: ${normalizeOutlinePointTitle(ponto.titulo)}`}
        >
          <p>{ponto.explicacao}</p>
          <p className="mt-2 text-muted">{ponto.exemplo_aplicacao}</p>
        </Section>
      ))}

      <Section title="Aplicações">{content.aplicacoes}</Section>
      <Section title="Conclusão">{content.conclusao}</Section>
      <Section title="Apelo">{content.apelo}</Section>
      <Section title="Oração">{content.oracao}</Section>

      <section className="flex flex-col gap-3 rounded-2xl border border-primary bg-primary-soft p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Esboço para o Púlpito
        </h2>
        <p className="text-sm text-muted">
          {content.esboco_pulpito.titulo} · {content.esboco_pulpito.texto_base}
        </p>
        <div className="flex flex-col gap-3">
          {content.esboco_pulpito.pontos.map((ponto, index) => (
            <div key={index}>
              <p className="font-semibold text-foreground">
                {index + 1}. {normalizeOutlinePointTitle(ponto.titulo)}
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
          Apelo: {content.esboco_pulpito.apelo}
        </p>
      </section>
    </div>
  );
}
