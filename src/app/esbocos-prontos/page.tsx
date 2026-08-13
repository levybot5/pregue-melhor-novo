import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { listReadyOutlines, listCategories, listFavoriteContentIds } from "@/services/database";
import { ReadyContentList, type ReadyContentCardItem } from "@/components/ReadyContentList";
import { BackLink } from "@/components/reading";

export const dynamic = "force-dynamic";

export default async function EsbocosProntosPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/esbocos-prontos");
  }

  const [outlines, categories, favoritedIds] = await Promise.all([
    listReadyOutlines(),
    listCategories(),
    listFavoriteContentIds("esboco_pronto"),
  ]);

  const items: ReadyContentCardItem[] = outlines.map((outline) => ({
    id: outline.id,
    slug: outline.slug,
    title: outline.title,
    baseText: outline.base_text,
    categoryId: outline.category_id,
    shortDescription: outline.short_description,
  }));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/" />

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Esboços Prontos
        </h1>
        <p className="text-muted">Estruturas objetivas para preparar sua mensagem com mais rapidez.</p>
      </header>

      <ReadyContentList
        basePath="/esbocos-prontos"
        items={items}
        categories={categories}
        favoritedIds={Array.from(favoritedIds)}
      />
    </main>
  );
}
