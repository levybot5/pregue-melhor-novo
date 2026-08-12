import type { DevotionalContent } from "@/services/ai";
import { BaseTextQuote, ReadingSection, ApplicationBlock } from "@/components/reading";

type DevotionalViewProps = {
  devotional: DevotionalContent;
};

// Devocional é leve por natureza: só o essencial, sem aprofundamentos,
// sem esboço, sem Modo Púlpito (item 17 da etapa).
export function DevotionalView({ devotional }: DevotionalViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={devotional.texto_base} />

      <ReadingSection title="Reflexão">{devotional.reflexao}</ReadingSection>

      <ApplicationBlock title="Aplicação">
        <p className="mb-1 text-sm font-medium text-muted">Como viver isso hoje?</p>
        {devotional.aplicacao}
      </ApplicationBlock>

      <section className="flex flex-col gap-1.5">
        <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">Oração</h2>
        <p className="text-[17px] leading-[1.75] text-foreground italic">{devotional.oracao}</p>
      </section>

      <BaseTextQuote text={devotional.versiculo_para_guardar} label="Versículo para Guardar" />
    </div>
  );
}
