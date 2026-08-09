import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getContentById } from "@/services/database";
import { sermonContentSchema } from "@/services/ai";
import { SermonView } from "@/components/SermonView";
import { getCurrentUser } from "@/services/auth";

// Sempre busca no request: o conteúdo precisa refletir o banco atual,
// não o que existia no momento do build. Nenhuma chamada de IA acontece
// aqui — só leitura do que já está salvo no Supabase.
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/biblioteca/${id}`);
  }

  let content: Awaited<ReturnType<typeof getContentById>> = null;
  let loadError = false;

  try {
    content = await getContentById(id);
  } catch (error) {
    console.error("Falha ao carregar conteúdo:", error);
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
        <p className="text-red-600">Não foi possível carregar este conteúdo agora.</p>
        <Link
          href="/biblioteca"
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          Voltar para a Biblioteca
        </Link>
      </main>
    );
  }

  if (!content) {
    notFound();
  }

  const sermon =
    content.type === "pregacao"
      ? sermonContentSchema.safeParse(content.content)
      : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {sermon?.success ? (
        <>
          <p className="text-xs text-muted">{formatDate(content.created_at)}</p>
          <SermonView sermon={sermon.data} />
        </>
      ) : (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {content.title}
            </h1>
            <p className="text-sm text-muted">
              {content.type}
              {content.base_text ? ` · ${content.base_text}` : ""} ·{" "}
              {formatDate(content.created_at)}
            </p>
          </header>

          {sermon && !sermon.success && (
            <p className="text-red-600">
              Este conteúdo não pôde ser exibido no formato de pregação.
            </p>
          )}

          <pre className="overflow-x-auto rounded-2xl border border-card-border bg-card p-4 text-sm text-foreground">
            {JSON.stringify(content.content, null, 2)}
          </pre>
        </>
      )}

      <Link
        href="/biblioteca"
        className="text-sm font-medium text-primary underline underline-offset-4"
      >
        Voltar para a Biblioteca
      </Link>
    </main>
  );
}
