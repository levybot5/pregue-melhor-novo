import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getContinueReading, getTodayMissionStatus } from "@/services/database";
import { getBook, listBooksByTestament } from "@/lib/bible/books-data";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { OpenBookIcon } from "@/components/icons";
import { TodayReadingCard } from "./TodayReadingCard";

// Progresso de leitura pode mudar a qualquer momento — nunca serve
// versão cacheada no build.
export const dynamic = "force-dynamic";

export default async function BibliaCompletaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/biblia-completa");
  }

  const [continueReading, missionStatus] = await Promise.all([
    getContinueReading(user.id),
    getTodayMissionStatus(user.id),
  ]);
  const continueBook = continueReading ? getBook(continueReading.book) : null;

  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
        <header className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-primary">
            <OpenBookIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Bíblia Guiada</h1>
          </span>
          <p className="text-muted">Leia a Bíblia inteira, com explicação por versículo.</p>
        </header>

        <TodayReadingCard status={missionStatus} />

        {continueBook && continueReading && (
          <Link
            href={`/biblia-completa/${continueBook.slug}/${continueReading.chapter}`}
            className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              Continuar lendo
            </span>
            <p className="text-base font-semibold text-foreground">
              {continueBook.name} {continueReading.chapter}
            </p>
            <span className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Continuar
            </span>
          </Link>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Antigo Testamento
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {listBooksByTestament("AT").map((book) => (
              <Link
                key={book.slug}
                href={`/biblia-completa/${book.slug}`}
                className="flex min-h-[52px] items-center rounded-xl border border-card-border bg-card px-4 text-sm font-medium text-foreground transition-colors active:bg-card-active"
              >
                {book.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Novo Testamento
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {listBooksByTestament("NT").map((book) => (
              <Link
                key={book.slug}
                href={`/biblia-completa/${book.slug}`}
                className="flex min-h-[52px] items-center rounded-xl border border-card-border bg-card px-4 text-sm font-medium text-foreground transition-colors active:bg-card-active"
              >
                {book.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
