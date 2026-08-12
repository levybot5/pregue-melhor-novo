import type { PulpitOutlineContent } from "@/services/ai";
import {
  BaseTextQuote,
  CompactBulletList,
  ApplicationBlock,
  ReadingSection,
} from "@/components/reading";

type PulpitOutlineViewProps = {
  outline: PulpitOutlineContent;
};

// Esboço para Púlpito é compacto por natureza — só o essencial:
// título, texto base, pontos em bullets, aplicação. Nada de cards
// pesados por ponto (item 20 da etapa).
export function PulpitOutlineView({ outline }: PulpitOutlineViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <BaseTextQuote text={outline.texto_base} compact />

      <p className="text-[15px] leading-relaxed text-muted">{outline.ideia_central}</p>

      <CompactBulletList items={outline.introducao} />

      <div className="flex flex-col gap-4">
        {outline.pontos.map((ponto, index) => (
          <div
            key={index}
            className={index === outline.pontos.length - 1 ? "" : "border-b border-card-border pb-4"}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg font-bold text-accent tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3 className="text-base font-bold tracking-tight text-primary uppercase">
                  {ponto.titulo}
                </h3>
                <p className="text-sm text-muted">{ponto.texto_relacionado}</p>
                <CompactBulletList items={ponto.bullets} />
                <p className="text-[15px] font-medium text-accent italic">
                  &ldquo;{ponto.frase_impacto}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ApplicationBlock title="Aplicação">
        <CompactBulletList items={outline.aplicacao_final} />
      </ApplicationBlock>

      <ReadingSection title="Apelo" emphasis>
        {outline.apelo}
      </ReadingSection>
      <ReadingSection title="Oração">{outline.oracao}</ReadingSection>
    </div>
  );
}
