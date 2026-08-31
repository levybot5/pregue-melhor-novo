import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getBook } from "@/lib/bible/books-data";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";

export const dynamic = "force-dynamic";

export default async function BibliaCompletaLivroPage({
  params,
}: {
  params: Promise<{ livro: string }>;
}) {
  const { livro } = await params;
  const book = getBook(livro);
  if (!book) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/biblia-completa/${livro}`);
  }

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <>
      <AppHeader backHref="/biblia-completa" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{book.name}</h1>
          <p className="text-muted">
            {book.chapters} {book.chapters === 1 ? "capítulo" : "capítulos"}
          </p>
        </header>

        <div className="grid grid-cols-5 gap-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter}
              href={`/biblia-completa/${book.slug}/${chapter}`}
              className="flex min-h-[48px] items-center justify-center rounded-xl border border-card-border bg-card text-sm font-medium text-foreground transition-colors active:bg-card-active"
            >
              {chapter}
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
