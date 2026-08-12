import type { SermonContent } from "@/services/ai";
import { normalizeOutlinePointTitle } from "@/lib/outline";
import {
  BaseTextQuote,
  ReadingSection,
  PointBlock,
  ExpandableSection,
  ApplicationBlock,
} from "@/components/reading";

type SermonViewProps = {
  sermon: SermonContent;
};

// Experiência de leitura, não um dashboard: texto corrido com respiro,
// pontos numerados, e o Contexto Bíblico como aprofundamento
// recolhido — não faz parte do fluxo principal de leitura.
export function SermonView({ sermon }: SermonViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={sermon.texto_base} />

      <ReadingSection title="Introdução">{sermon.introducao}</ReadingSection>

      <ExpandableSection title="Contexto Bíblico">{sermon.contexto_biblico}</ExpandableSection>

      <div className="flex flex-col gap-5">
        {sermon.pontos.map((ponto, index) => (
          <PointBlock
            key={index}
            index={index + 1}
            title={normalizeOutlinePointTitle(ponto.titulo)}
            last={index === sermon.pontos.length - 1}
          >
            <p>{ponto.explicacao}</p>
            <p className="mt-2 text-[15px] text-muted italic">{ponto.exemplo_aplicacao}</p>
          </PointBlock>
        ))}
      </div>

      <ApplicationBlock title="Aplicação">{sermon.aplicacao_final}</ApplicationBlock>

      <ReadingSection title="Conclusão">{sermon.conclusao}</ReadingSection>
      <ReadingSection title="Apelo" emphasis>
        {sermon.apelo}
      </ReadingSection>
      <ReadingSection title="Oração">{sermon.oracao_final}</ReadingSection>

      <section className="flex flex-col gap-3 rounded-2xl border border-accent/40 bg-accent-soft/40 p-4">
        <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
          Esboço para o Púlpito
        </h2>
        <p className="text-sm text-muted">
          {sermon.esboco_pulpito.titulo} · {sermon.esboco_pulpito.texto_base}
        </p>
        <div className="flex flex-col gap-3">
          {sermon.esboco_pulpito.pontos.map((ponto, index) => (
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
        <p className="font-semibold text-foreground">Apelo: {sermon.esboco_pulpito.apelo}</p>
      </section>
    </div>
  );
}
