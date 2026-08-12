import type { ReadyOutline } from "@/services/database";
import { BaseTextQuote, CompactBulletList, ApplicationBlock } from "@/components/reading";

type ReadyOutlineViewProps = {
  outline: ReadyOutline;
};

// Mesma filosofia compacta do Esboço para Púlpito (item 20 da etapa).
export function ReadyOutlineView({ outline }: ReadyOutlineViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <BaseTextQuote text={outline.base_text} compact />

      <p className="text-[15px] leading-relaxed text-muted">{outline.central_idea}</p>

      <p className="text-[16px] leading-relaxed text-foreground">{outline.short_introduction}</p>

      <div className="flex flex-col gap-4">
        {outline.points.map((ponto, index) => (
          <div
            key={index}
            className={index === outline.points.length - 1 ? "" : "border-b border-card-border pb-4"}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg font-bold text-accent tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3 className="text-base font-bold tracking-tight text-primary uppercase">
                  {ponto.title}
                </h3>
                <CompactBulletList items={ponto.bullets} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ApplicationBlock title="Aplicações">
        <CompactBulletList items={outline.applications} />
      </ApplicationBlock>

      {outline.conclusion_appeal && (
        <p className="text-[16px] leading-relaxed font-medium text-primary">
          {outline.conclusion_appeal}
        </p>
      )}
    </div>
  );
}
