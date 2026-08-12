import type { BibleStudyContent } from "@/services/ai";
import { BaseTextQuote, ReadingSection, ApplicationBlock } from "@/components/reading";

type BibleStudyViewProps = {
  study: BibleStudyContent;
};

// Bíblia Explicada é estudo, não pregação: sem aprofundamentos
// recolhidos — Contexto, Explicação, Palavra no Original e Conexões
// fazem parte direta da sequência de leitura (item 19 da etapa).
export function BibleStudyView({ study }: BibleStudyViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={study.passagem} />

      <p className="text-[17px] leading-[1.75] font-medium text-primary">
        {study.verdade_principal}
      </p>

      <ReadingSection title="Contexto Bíblico">{study.contexto_biblico}</ReadingSection>
      <ReadingSection title="Explicação do Texto">{study.explicacao_texto}</ReadingSection>

      {study.palavra_original && (
        <section className="flex flex-col gap-1 rounded-2xl border-l-[3px] border-accent bg-accent-soft/40 px-4 py-3">
          <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
            Palavra no Original
          </h2>
          <p className="text-lg font-bold text-primary">{study.palavra_original.palavra}</p>
          <p className="text-[16px] leading-[1.7] text-foreground">
            {study.palavra_original.significado}
          </p>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
          Conexões Bíblicas
        </h2>
        <div className="flex flex-col divide-y divide-card-border">
          {study.conexoes_biblicas.map((conexao, index) => (
            <div key={index} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
              <p className="font-semibold text-primary">{conexao.referencia}</p>
              <p className="text-[15px] text-muted">{conexao.explicacao}</p>
            </div>
          ))}
        </div>
      </section>

      <ApplicationBlock title="Aplicação para a Vida Cristã">
        {study.aplicacao_vida_crista}
      </ApplicationBlock>

      <ReadingSection title="Cuidado de Interpretação" emphasis>
        {study.cuidado_interpretacao}
      </ReadingSection>
      <ReadingSection title="Resumo">{study.resumo_final}</ReadingSection>
    </div>
  );
}
