import type { AulaBiblicaContent } from "@/services/ai";
import {
  BaseTextQuote,
  ReadingSection,
  PointBlock,
  ExpandableSection,
  ApplicationBlock,
  CompactBulletList,
} from "@/components/reading";

type AulaBiblicaViewProps = {
  aula: AulaBiblicaContent;
};

// Cópia local do helper — convenção do arquivo (ver SermonView.tsx),
// não compartilhado entre Views.
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

export function AulaBiblicaView({ aula }: AulaBiblicaViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <BaseTextQuote text={aula.texto_base} />

      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
          Objetivo da Aula
        </h2>
        <p className="text-[17px] leading-[1.75] font-medium text-primary">{aula.objetivo_aula}</p>
      </div>

      <ReadingSection title="Introdução">
        <Paragraphs text={aula.introducao} />
      </ReadingSection>

      <ReadingSection title="Contexto Bíblico">
        <Paragraphs text={aula.contexto_biblico} />
      </ReadingSection>

      <div className="flex flex-col gap-5">
        {aula.pontos.map((ponto, index) => (
          <PointBlock
            key={index}
            index={index + 1}
            title={ponto.titulo}
            last={index === aula.pontos.length - 1}
          >
            <Paragraphs text={ponto.explicacao} />
            <div className="mt-3 flex flex-col gap-2">
              <CompactBulletList items={ponto.referencias} />
              {ponto.exemplo_aplicacao && (
                <ExpandableSection title="Exemplo / Aplicação">
                  <p>{ponto.exemplo_aplicacao}</p>
                </ExpandableSection>
              )}
              <p className="mt-1 text-sm font-medium text-accent italic">
                Pergunta para a turma: {ponto.pergunta_participacao}
              </p>
            </div>
          </PointBlock>
        ))}
      </div>

      {aula.conceitos_importantes && (
        <ReadingSection title="Conceitos Importantes">
          <div className="flex flex-col gap-3">
            {aula.conceitos_importantes.map((conceito, index) => (
              <div key={index}>
                <p className="font-semibold text-foreground">{conceito.termo}</p>
                <p>{conceito.explicacao}</p>
              </div>
            ))}
          </div>
        </ReadingSection>
      )}

      <ApplicationBlock title="Aplicação Prática">
        <Paragraphs text={aula.aplicacao_pratica} />
      </ApplicationBlock>

      <ReadingSection title="Perguntas para Discussão">
        <CompactBulletList items={aula.perguntas_discussao} />
      </ReadingSection>

      {aula.atividade_dinamica && (
        <section className="flex flex-col gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/40 p-4">
          <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
            Atividade: {aula.atividade_dinamica.titulo}
          </h2>
          <p className="text-[16px] leading-[1.7] text-foreground">
            {aula.atividade_dinamica.instrucoes}
          </p>
        </section>
      )}

      <ReadingSection title="Conclusão">
        <Paragraphs text={aula.conclusao} />
      </ReadingSection>
      <ReadingSection title="Desafio da Semana" emphasis>
        {aula.desafio_semana}
      </ReadingSection>
    </div>
  );
}
