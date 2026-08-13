import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { listReadySermons, listCategories, listFavoriteContentIds } from "@/services/database";
import { ReadyContentList, type ReadyContentCardItem } from "@/components/ReadyContentList";
import { BackLink } from "@/components/reading";

// Sempre busca no request: acervo editorial e favoritos podem mudar
// entre visitas. Nenhuma chamada de IA acontece aqui.
export const dynamic = "force-dynamic";

export default async function PregacoesProntasPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/pregacoes-prontas");
  }

  const [sermons, categories, favoritedIds] = await Promise.all([
    listReadySermons(),
    listCategories(),
    listFavoriteContentIds("pregacao_pronta"),
  ]);

  const items: ReadyContentCardItem[] = sermons.map((sermon) => ({
    id: sermon.id,
    slug: sermon.slug,
    title: sermon.title,
    baseText: sermon.base_text,
    categoryId: sermon.category_id,
    shortDescription: sermon.short_description,
  }));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/" />

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pregações Prontas
        </h1>
        <p className="text-muted">Mensagens completas para estudar, adaptar e ministrar.</p>
      </header>

      <ReadyContentList
        basePath="/pregacoes-prontas"
        items={items}
        categories={categories}
        favoritedIds={Array.from(favoritedIds)}
      />
    </main>
  );
}
