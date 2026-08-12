import type { ReadySermon } from "@/services/database";
import {
  BaseTextQuote,
  ReadingSection,
  PointBlock,
  ApplicationBlock,
  CompactBulletList,
} from "@/components/reading";

type ReadySermonViewProps = {
  sermon: ReadySermon;
};

// Mesma identidade editorial da Pregação Completa (item 18 da etapa) —
// uma Pregação Pronta deve parecer tão premium quanto uma gerada.
export function ReadySermonView({ sermon }: ReadySermonViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={sermon.base_text} />

      <ReadingSection title="Introdução">{sermon.introduction}</ReadingSection>

      <div className="flex flex-col gap-5">
        {sermon.points.map((ponto, index) => (
          <PointBlock
            key={index}
            index={index + 1}
            title={ponto.title}
            last={index === sermon.points.length - 1}
          >
            <p>{ponto.text}</p>
            {ponto.items && ponto.items.length > 0 && (
              <div className="mt-2">
                <CompactBulletList items={ponto.items} />
              </div>
            )}
          </PointBlock>
        ))}
      </div>

      <ApplicationBlock title="Aplicação">{sermon.application}</ApplicationBlock>

      <ReadingSection title="Conclusão">{sermon.conclusion}</ReadingSection>
      {sermon.appeal && (
        <ReadingSection title="Apelo" emphasis>
          {sermon.appeal}
        </ReadingSection>
      )}
      {sermon.prayer && <ReadingSection title="Oração">{sermon.prayer}</ReadingSection>}
    </div>
  );
}
