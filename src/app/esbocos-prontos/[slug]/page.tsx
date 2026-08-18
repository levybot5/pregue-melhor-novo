import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import {
  getReadyOutlineBySlug,
  listFavoriteContentIds,
  listCategories,
} from "@/services/database";
import { ReadyOutlineView } from "@/components/ReadyOutlineView";
import { ContentToolbar } from "@/components/ContentToolbar";
import { BackLink, ReadingHeader } from "@/components/reading";

export const dynamic = "force-dynamic";

export default async function EsbocoProntoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/esbocos-prontos/${slug}`);
  }

  const [outline, favoritedIds, categories] = await Promise.all([
    getReadyOutlineBySlug(slug),
    listFavoriteContentIds("esboco_pronto"),
    listCategories(),
  ]);

  if (!outline) {
    notFound();
  }

  const isFavorited = favoritedIds.has(outline.id);
  const categoryLabel = categories.find((cat) => cat.id === outline.category_id)?.label;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <BackLink href="/esbocos-prontos" />

      <ReadingHeader
        title={outline.title}
        categoryLabel={categoryLabel}
        favorited={isFavorited}
      />

      <ReadyOutlineView outline={outline} />

      <ContentToolbar
        contentType="esboco_pronto"
        content={outline}
        title={outline.title}
        favorite={{
          contentType: "esboco_pronto",
          contentId: outline.id,
          initialFavorited: isFavorited,
        }}
      />
    </main>
  );
}
