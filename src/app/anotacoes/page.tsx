import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { listPersonalNotes, listAllNotes } from "@/services/database";
import { getBook } from "@/lib/bible/books-data";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { NotesListClient } from "./NotesListClient";
import type { UnifiedNoteItem } from "./types";

// Lista muda a qualquer momento (criar/editar/excluir) — nunca serve
// versão cacheada no build, mesmo padrão de biblioteca/page.tsx.
export const dynamic = "force-dynamic";

export default async function AnotacoesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/anotacoes");
  }

  const [personalNotes, verseNotes] = await Promise.all([
    listPersonalNotes(user.id),
    listAllNotes(user.id),
  ]);

  // Junta os dois tipos numa lista só, mais recente primeiro — cada
  // item guarda pra onde o clique deve levar (ver types.ts).
  const items: UnifiedNoteItem[] = [
    ...personalNotes.map(
      (note): UnifiedNoteItem => ({
        kind: "personal",
        id: note.id,
        title: note.title,
        content: note.content,
        updatedAt: note.updatedAt,
      }),
    ),
    ...verseNotes.map((note): UnifiedNoteItem => {
      const [bookSlug, chapter, verse] = note.verseId.split(".");
      const bookInfo = getBook(bookSlug);
      return {
        kind: "verse",
        verseId: note.verseId,
        reference: `${bookInfo?.name ?? bookSlug} ${chapter}:${verse}`,
        href: `/biblia-completa/${bookSlug}/${chapter}`,
        note: note.note,
        updatedAt: note.updatedAt,
      };
    }),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bloco de Anotações</h1>
          <p className="text-muted">
            Guarde ideias, versículos e insights para suas próximas mensagens.
          </p>
        </header>

        <NotesListClient initialItems={items} />
      </main>
      <BottomNav />
    </>
  );
}
