import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import {
  getChapterVerses,
  recordChapterRead,
  listHighlights,
  listNotes,
  bibleReaderVersions,
  DEFAULT_BIBLE_VERSION,
  BIBLE_READER_VERSION_LABELS,
  isBibleReaderVersion,
} from "@/services/database";
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
  searchParams,
}: {
  params: Promise<{ livro: string; capitulo: string }>;
  searchParams: Promise<{ versao?: string }>;
}) {
  const { livro, capitulo } = await params;
  const { versao } = await searchParams;
  const book = getBook(livro);
  const chapterNum = Number(capitulo);
  if (!book || !Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
    notFound();
  }
  const version = versao && isBibleReaderVersion(versao) ? versao : DEFAULT_BIBLE_VERSION;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/biblia-completa/${livro}/${capitulo}`);
  }

  const [verses, highlights, notes] = await Promise.all([
    getChapterVerses(book.slug, chapterNum, version),
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
  // Preserva a tradução escolhida ao navegar de capítulo — sem isso,
  // trocar de capítulo voltava sempre pro ACF (padrão), mesmo lendo em
  // Bíblia Livre.
  const versionQuery = version === DEFAULT_BIBLE_VERSION ? "" : `?versao=${version}`;

  return (
    <>
      <AppHeader backHref={`/biblia-completa/${book.slug}`} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:max-w-4xl lg:px-8 lg:pb-10">
        <div className="flex gap-2 self-start rounded-full border border-card-border bg-card p-1 text-xs font-semibold">
          {bibleReaderVersions.map((v) => (
            <Link
              key={v}
              href={v === DEFAULT_BIBLE_VERSION ? `/biblia-completa/${livro}/${capitulo}` : `/biblia-completa/${livro}/${capitulo}?versao=${v}`}
              className={`rounded-full px-3 py-1.5 ${
                v === version ? "bg-primary text-primary-foreground" : "text-muted"
              }`}
            >
              {BIBLE_READER_VERSION_LABELS[v]}
            </Link>
          ))}
        </div>
        {version === "blivre" && (
          // Exigência da licença CC BY 3.0 Brasil (uso comercial
          // permitido, mas com atribuição — ver LICENCA.md do projeto
          // blivre/BibliaLivre): crédito visível sempre que o texto
          // desta tradução aparece na tela.
          <p className="text-xs text-muted">
            Texto:{" "}
            <a
              href="https://sites.google.com/site/biblialivre/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Bíblia Livre (BLIVRE)
            </a>
            , licença Creative Commons Atribuição 3.0 Brasil.
          </p>
        )}

        {verses.length === 0 ? (
          <p className="text-red-600">
            Este capítulo ainda não foi carregado nesta tradução. Tente a outra versão acima.
          </p>
        ) : (
          <VerseReader
            book={book.slug}
            bookName={book.name}
            chapter={chapterNum}
            verses={verses}
            initialHighlights={Object.fromEntries(highlights)}
            initialNotes={Object.fromEntries(notes)}
            previousHref={previous ? `/biblia-completa/${previous.slug}/${previous.chapter}${versionQuery}` : null}
            nextHref={next ? `/biblia-completa/${next.slug}/${next.chapter}${versionQuery}` : null}
          />
        )}
      </main>
      <BottomNav />
    </>
  );
}
