import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getReadySermonBySlug, listFavoriteContentIds } from "@/services/database";
import { ReadySermonView } from "@/components/ReadySermonView";
import { ContentToolbar } from "@/components/ContentToolbar";

export const dynamic = "force-dynamic";

export default async function PregacaoProntaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/pregacoes-prontas/${slug}`);
  }

  const [sermon, favoritedIds] = await Promise.all([
    getReadySermonBySlug(slug),
    listFavoriteContentIds("pregacao_pronta"),
  ]);

  if (!sermon) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ContentToolbar
        contentType="pregacao_pronta"
        content={sermon}
        title={sermon.title}
        favorite={{
          contentType: "pregacao_pronta",
          contentId: sermon.id,
          initialFavorited: favoritedIds.has(sermon.id),
        }}
      />

      <ReadySermonView sermon={sermon} />

      <Link
        href="/pregacoes-prontas"
        className="text-sm font-medium text-primary underline underline-offset-4"
      >
        Voltar para Pregações Prontas
      </Link>
    </main>
  );
}
