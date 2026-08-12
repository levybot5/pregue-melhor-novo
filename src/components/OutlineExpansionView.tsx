import type { OutlineExpansionContent } from "@/services/ai";
import { normalizeOutlinePointTitle } from "@/lib/outline";
import {
  BaseTextQuote,
  ReadingSection,
  PointBlock,
  ExpandableSection,
  ApplicationBlock,
} from "@/components/reading";

type OutlineExpansionViewProps = {
  content: OutlineExpansionContent;
};

export function OutlineExpansionView({ content }: OutlineExpansionViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={content.texto_base} />

      <ReadingSection title="Introdução">{content.introducao}</ReadingSection>

      {content.contexto && (
        <ExpandableSection title="Contexto Bíblico">{content.contexto}</ExpandableSection>
      )}

      <div className="flex flex-col gap-5">
        {content.pontos.map((ponto, index) => (
          <PointBlock
            key={index}
            index={index + 1}
            title={normalizeOutlinePointTitle(ponto.titulo)}
            last={index === content.pontos.length - 1}
          >
            <p>{ponto.explicacao}</p>
            <p className="mt-2 text-[15px] text-muted italic">{ponto.exemplo_aplicacao}</p>
          </PointBlock>
        ))}
      </div>

      <ApplicationBlock title="Aplicação">{content.aplicacoes}</ApplicationBlock>

      <ReadingSection title="Conclusão">{content.conclusao}</ReadingSection>
      <ReadingSection title="Apelo" emphasis>
        {content.apelo}
      </ReadingSection>
      <ReadingSection title="Oração">{content.oracao}</ReadingSection>

      <section className="flex flex-col gap-3 rounded-2xl border border-accent/40 bg-accent-soft/40 p-4">
        <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
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
