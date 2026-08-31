import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getPersonalNote } from "@/services/database";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { NoteEditor } from "./NoteEditor";

export const dynamic = "force-dynamic";

export default async function AnotacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/anotacoes/${id}`);
  }

  const note = await getPersonalNote(user.id, id);
  if (!note) {
    notFound();
  }

  return (
    <>
      <AppHeader backHref="/anotacoes" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
        <NoteEditor note={note} />
      </main>
      <BottomNav />
    </>
  );
}
