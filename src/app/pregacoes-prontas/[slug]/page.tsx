import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import {
  getReadySermonBySlug,
  listFavoriteContentIds,
  listCategories,
} from "@/services/database";
import { ReadySermonView } from "@/components/ReadySermonView";
import { ContentToolbar } from "@/components/ContentToolbar";
import { BackLink, ReadingHeader } from "@/components/reading";

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

  const [sermon, favoritedIds, categories] = await Promise.all([
    getReadySermonBySlug(slug),
    listFavoriteContentIds("pregacao_pronta"),
    listCategories(),
  ]);

  if (!sermon) {
    notFound();
  }

  const isFavorited = favoritedIds.has(sermon.id);
  const categoryLabel = categories.find((cat) => cat.id === sermon.category_id)?.label;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <BackLink href="/pregacoes-prontas" />

      <ReadingHeader
        title={sermon.title}
        categoryLabel={categoryLabel}
        favorited={isFavorited}
      />

      <ReadySermonView sermon={sermon} />

      <ContentToolbar
        contentType="pregacao_pronta"
        content={sermon}
        title={sermon.title}
        favorite={{
          contentType: "pregacao_pronta",
          contentId: sermon.id,
          initialFavorited: isFavorited,
        }}
      />
    </main>
  );
}
