import type { BibleDictionaryEntry, BibleDictionaryType } from "@/services/ai";
import { ReadingSection, CompactBulletList } from "@/components/reading";

type DictionaryEntryViewProps = {
  entry: BibleDictionaryEntry;
};

const TYPE_LABELS: Record<BibleDictionaryType, string> = {
  pessoa: "Pessoa",
  lugar: "Lugar",
  conceito: "Conceito",
  povo_ou_grupo: "Povo ou grupo",
  objeto: "Objeto",
};

// Campos fixos de "pessoa", na ordem pedida: Contexto, Principais
// Acontecimentos, Características, Acertos, Erros — sempre seções
// separadas (nunca "Acertos e Erros" juntos). Referências Principais
// vem antes de Lições nesse tipo especificamente.
type PersonFieldKey =
  | "contexto"
  | "principais_acontecimentos"
  | "caracteristicas"
  | "acertos"
  | "erros";

const PERSON_FIELD_LABELS: { key: PersonFieldKey; label: string }[] = [
  { key: "contexto", label: "Contexto" },
  { key: "principais_acontecimentos", label: "Principais Acontecimentos" },
  { key: "caracteristicas", label: "Características" },
  { key: "acertos", label: "Acertos" },
  { key: "erros", label: "Erros" },
];

function TypeBadge({ tipo }: { tipo: BibleDictionaryType }) {
  return (
    <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
      {TYPE_LABELS[tipo]}
    </span>
  );
}

// Consulta rápida, não estudo — verbete curto e bem escaneável.
export function DictionaryEntryView({ entry }: DictionaryEntryViewProps) {
  if (entry.tipo === "pessoa") {
    const { secoes_pessoa } = entry;
    return (
      <div className="flex flex-col gap-6">
        <TypeBadge tipo={entry.tipo} />

        <section className="flex flex-col gap-1.5">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-primary">
            Quem foi
          </h2>
          <p className="text-[17px] leading-[1.75] font-medium text-primary">
            {entry.identificacao}
          </p>
        </section>

        {PERSON_FIELD_LABELS.map(
          ({ key, label }) =>
            secoes_pessoa[key] && (
              <ReadingSection key={key} title={label}>
                {secoes_pessoa[key]}
              </ReadingSection>
            ),
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
            Referências Principais
          </h2>
          <CompactBulletList items={entry.referencias_biblicas} />
        </section>

        {secoes_pessoa.licoes && (
          <ReadingSection title="Lições">{secoes_pessoa.licoes}</ReadingSection>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TypeBadge tipo={entry.tipo} />

      <p className="text-[17px] leading-[1.75] font-medium text-primary">
        {entry.identificacao}
      </p>

      {entry.secoes.map((secao, index) => (
        <ReadingSection key={index} title={secao.titulo}>
          {secao.conteudo}
        </ReadingSection>
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">
          Referências Bíblicas
        </h2>
        <CompactBulletList items={entry.referencias_biblicas} />
      </section>
    </div>
  );
}
