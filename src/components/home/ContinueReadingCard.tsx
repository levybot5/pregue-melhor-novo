import Link from "next/link";
import type { BibleContinueReading } from "@/services/database";
import { getBook } from "@/lib/bible/books-data";
import { OpenBookIcon } from "@/components/icons";

type ContinueReadingCardProps = {
  continueReading: BibleContinueReading;
};

// Só aparece pra quem já leu pelo menos um capítulo (continueReading
// nunca é null quando isso renderiza — checado no page.tsx). % aqui é
// do livro atual (capítulo/total de capítulos do livro) — sem consulta
// nova, book.chapters já é dado estático. O % da Bíblia inteira fica
// dentro da própria Bíblia Guiada (ver /biblia-completa/page.tsx), não
// na Home.
export function ContinueReadingCard({ continueReading }: ContinueReadingCardProps) {
  const book = getBook(continueReading.book);
  const percentOfBookDone = book
    ? Math.round((continueReading.chapter / book.chapters) * 100)
    : 0;
  const percentOfBookRemaining = Math.max(0, 100 - percentOfBookDone);

  return (
    <Link
      href={`/biblia-completa/${continueReading.book}/${continueReading.chapter}`}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101B2D] p-4 transition-colors active:bg-white/5"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-white">
        <OpenBookIcon className="h-4 w-4 text-accent" />
        Continuar lendo
      </span>
      <span className="text-base font-bold text-white">
        {book?.name ?? continueReading.book} {continueReading.chapter}
      </span>
      {/* Barra própria (não a <ProgressBar> compartilhada) — essa usa
          bg-card-active, um cinza claro pensado pro tema claro do resto
          do app, que ficaria lavado no cartão escuro da Home. */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${Math.min(100, percentOfBookDone)}%` }}
        />
      </div>
      <span className="text-xs text-slate-400">
        Faltam {percentOfBookRemaining}% para terminar {book?.name ?? continueReading.book}
      </span>
    </Link>
  );
}
