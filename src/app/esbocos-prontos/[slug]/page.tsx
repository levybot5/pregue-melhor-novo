import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getReadyOutlineBySlug, listFavoriteContentIds } from "@/services/database";
import { ReadyOutlineView } from "@/components/ReadyOutlineView";
import { ContentToolbar } from "@/components/ContentToolbar";

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

  const [outline, favoritedIds] = await Promise.all([
    getReadyOutlineBySlug(slug),
    listFavoriteContentIds("esboco_pronto"),
  ]);

  if (!outline) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ContentToolbar
        contentType="esboco_pronto"
        content={outline}
        title={outline.title}
        favorite={{
          contentType: "esboco_pronto",
          contentId: outline.id,
          initialFavorited: favoritedIds.has(outline.id),
        }}
      />

      <ReadyOutlineView outline={outline} />

      <Link
        href="/esbocos-prontos"
        className="text-sm font-medium text-primary underline underline-offset-4"
      >
        Voltar para Esboços Prontos
      </Link>
    </main>
  );
}
