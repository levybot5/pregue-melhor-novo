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

// Divide um texto em parágrafos curtos (a IA separa por linha em
// branco) — sem isso, todo o campo vira um único bloco visual, mesmo
// que o texto já tenha sido escrito em parágrafos.
function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

// Experiência de leitura, não um dashboard: texto corrido com respiro
// e pontos numerados. Palavra no Original e Aplicação de cada ponto
// ficam recolhidas — apoio para o pregador, não parte do fluxo
// principal de leitura, que já inclui Contexto Bíblico e Ideia
// Central diretamente.
export function SermonView({ sermon }: SermonViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={sermon.texto_base} />

      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
          Ideia Central
        </h2>
        <p className="text-[17px] leading-[1.75] font-medium text-primary">
          {sermon.tema_central}
        </p>
      </div>

      <ReadingSection title="Introdução">
        <Paragraphs text={sermon.introducao} />
      </ReadingSection>

      <ReadingSection title="Contexto Bíblico">
        <Paragraphs text={sermon.contexto_biblico} />
      </ReadingSection>

      <div className="flex flex-col gap-5">
        {sermon.pontos.map((ponto, index) => (
          <PointBlock
            key={index}
            index={index + 1}
            title={normalizeOutlinePointTitle(ponto.titulo)}
            last={index === sermon.pontos.length - 1}
          >
            <Paragraphs text={ponto.explicacao} />
            <div className="mt-3 flex flex-col gap-2">
              {ponto.palavra_original && (
                <ExpandableSection title="Palavra no Original">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                      {ponto.palavra_original.idioma}
                    </p>
                    <p className="text-base font-bold text-primary">
                      {ponto.palavra_original.palavra}{" "}
                      <span className="text-sm font-normal text-muted">
                        ({ponto.palavra_original.transliteracao})
                      </span>
                    </p>
                    <p>{ponto.palavra_original.significado}</p>
                    <p className="italic">{ponto.palavra_original.aplicacao}</p>
                  </div>
                </ExpandableSection>
              )}
              <ExpandableSection title="Aplicação Prática">
                <p>{ponto.exemplo_aplicacao}</p>
              </ExpandableSection>
            </div>
          </PointBlock>
        ))}
      </div>

      <ApplicationBlock title="Aplicação">
        <Paragraphs text={sermon.aplicacao_final} />
      </ApplicationBlock>

      <ReadingSection title="Conclusão">
        <Paragraphs text={sermon.conclusao} />
      </ReadingSection>
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
