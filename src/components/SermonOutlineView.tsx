import type { SermonOutlineContent } from "@/services/ai";
import { BaseTextQuote, CompactBulletList, ReadingSection } from "@/components/reading";

type SermonOutlineViewProps = {
  outline: SermonOutlineContent;
};

// Pregação para Esboço: consulta rápida no púlpito, não leitura
// corrida — títulos fortes, bullets, referências visíveis, bastante
// espaço. Nunca parágrafos densos (a mensagem já foi lida na
// pregação original do próprio pastor).
export function SermonOutlineView({ outline }: SermonOutlineViewProps) {
  return (
    <div className="flex flex-col gap-5">
      {outline.texto_base && <BaseTextQuote text={outline.texto_base} compact />}

      <p className="text-[15px] leading-relaxed text-muted">{outline.ideia_central}</p>

      {outline.introducao.length > 0 && <CompactBulletList items={outline.introducao} />}

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
                {ponto.referencias.length > 0 && (
                  <p className="text-sm text-muted">{ponto.referencias.join(" · ")}</p>
                )}
                <CompactBulletList items={ponto.bullets} />
                {ponto.frase_chave && (
                  <p className="text-[15px] font-medium text-accent italic">
                    &ldquo;{ponto.frase_chave}&rdquo;
                  </p>
                )}
                {ponto.aplicacao && (
                  <p className="text-sm text-foreground">{ponto.aplicacao}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {outline.conclusao.length > 0 && (
        <ReadingSection title="Conclusão">
          <CompactBulletList items={outline.conclusao} />
        </ReadingSection>
      )}

      {outline.apelo && (
        <ReadingSection title="Apelo" emphasis>
          {outline.apelo}
        </ReadingSection>
      )}
    </div>
  );
}
