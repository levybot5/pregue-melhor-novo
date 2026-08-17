import type { BibleStudyContent } from "@/services/ai";
import { BaseTextQuote, ReadingSection, ApplicationBlock } from "@/components/reading";

type BibleStudyViewProps = {
  study: BibleStudyContent;
};

// Bíblia Explicada é estudo, não pregação: "Explicação do Texto" faz o
// papel de um comentário bíblico acessível — de propósito não existe
// uma segunda seção de "comentário" separada (ver relatório da etapa).
export function BibleStudyView({ study }: BibleStudyViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={study.passagem} />

      {study.contexto && (
        <ReadingSection title="Contexto">{study.contexto}</ReadingSection>
      )}

      <ReadingSection title="Explicação do Texto">{study.explicacao}</ReadingSection>

      {study.palavra_original && (
        <section className="flex flex-col gap-1 rounded-2xl border-l-[3px] border-accent bg-accent-soft/40 px-4 py-3">
          <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
            Palavra no Original
          </h2>
          <p className="text-lg font-bold text-primary">
            {study.palavra_original.termo}
            {study.palavra_original.transliteracao && (
              <span className="ml-2 text-sm font-medium text-muted">
                ({study.palavra_original.transliteracao})
              </span>
            )}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {study.palavra_original.idioma}
          </p>
          <p className="text-[16px] leading-[1.7] text-foreground">
            {study.palavra_original.significado}
          </p>
          <p className="text-[16px] leading-[1.7] text-foreground">
            {study.palavra_original.explicacao}
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

      <ApplicationBlock title="Aplicação Prática">{study.aplicacao}</ApplicationBlock>

      <ReadingSection title="Resumo">{study.resumo}</ReadingSection>
    </div>
  );
}
