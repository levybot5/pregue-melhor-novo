import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getChapterVerses, recordChapterRead, listHighlights, listNotes } from "@/services/database";
import { getBook, getAdjacentChapter } from "@/lib/bible/books-data";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { VerseReader } from "./VerseReader";

export const dynamic = "force-dynamic";
// Explicar um versículo chama a Gemini — mesmo teto usado nas outras
// ferramentas (ver src/app/biblia/page.tsx).
export const maxDuration = 60;

export default async function BibliaCompletaCapituloPage({
  params,
}: {
  params: Promise<{ livro: string; capitulo: string }>;
}) {
  const { livro, capitulo } = await params;
  const book = getBook(livro);
  const chapterNum = Number(capitulo);
  if (!book || !Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/biblia-completa/${livro}/${capitulo}`);
  }

  const [verses, highlights, notes] = await Promise.all([
    getChapterVerses(book.slug, chapterNum),
    listHighlights(user.id, book.slug, chapterNum),
    listNotes(user.id, book.slug, chapterNum),
  ]);

  // Não bloqueia a leitura se falhar — só não fica registrado como
  // "último lido" desta vez.
  try {
    await recordChapterRead(user.id, book.slug, chapterNum);
  } catch (error) {
    console.error("Falha ao registrar progresso de leitura:", error);
  }

  const previous = getAdjacentChapter(book.slug, chapterNum, "prev");
  const next = getAdjacentChapter(book.slug, chapterNum, "next");

  return (
    <>
      <AppHeader backHref={`/biblia-completa/${book.slug}`} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:max-w-4xl lg:px-8 lg:pb-10">
        {verses.length === 0 ? (
          <p className="text-red-600">
            Este capítulo ainda não foi carregado. Tente novamente mais tarde.
          </p>
        ) : (
          <VerseReader
            book={book.slug}
            bookName={book.name}
            chapter={chapterNum}
            verses={verses}
            initialHighlights={Object.fromEntries(highlights)}
            initialNotes={Object.fromEntries(notes)}
            previousHref={previous ? `/biblia-completa/${previous.slug}/${previous.chapter}` : null}
            nextHref={next ? `/biblia-completa/${next.slug}/${next.chapter}` : null}
          />
        )}
      </main>
      <BottomNav />
    </>
  );
}
