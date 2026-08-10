import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getContentById } from "@/services/database";
import {
  sermonContentSchema,
  bibleStudyContentSchema,
  outlineExpansionContentSchema,
  pulpitOutlineContentSchema,
} from "@/services/ai";
import { SermonView } from "@/components/SermonView";
import { BibleStudyView } from "@/components/BibleStudyView";
import { OutlineExpansionView } from "@/components/OutlineExpansionView";
import { PulpitOutlineView } from "@/components/PulpitOutlineView";
import { ContentToolbar } from "@/components/ContentToolbar";
import { getCurrentUser } from "@/services/auth";
import { getContentTypeLabel } from "@/lib/content-types";

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

function renderByType(type: string, raw: Record<string, unknown>, title: string) {
  switch (type) {
    case "pregacao": {
      const parsed = sermonContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ContentToolbar contentType="pregacao" content={parsed.data} title={title} />
          <SermonView sermon={parsed.data} />
        </>
      );
    }
    case "biblia_explicada": {
      const parsed = bibleStudyContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ContentToolbar contentType="biblia_explicada" content={parsed.data} title={title} />
          <BibleStudyView study={parsed.data} />
        </>
      );
    }
    case "esboco_pregacao": {
      const parsed = outlineExpansionContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ContentToolbar contentType="esboco_pregacao" content={parsed.data} title={title} />
          <OutlineExpansionView content={parsed.data} />
        </>
      );
    }
    case "esboco_pulpito": {
      const parsed = pulpitOutlineContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ContentToolbar contentType="esboco_pulpito" content={parsed.data} title={title} />
          <PulpitOutlineView outline={parsed.data} />
        </>
      );
    }
    default:
      return null;
  }
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

  const rendered = renderByType(content.type, content.content, content.title);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {rendered ? (
        <>
          <p className="text-xs text-muted">{formatDate(content.created_at)}</p>
          {rendered}
        </>
      ) : (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {content.title}
            </h1>
            <p className="text-sm text-muted">
              {getContentTypeLabel(content.type)}
              {content.base_text ? ` · ${content.base_text}` : ""} ·{" "}
              {formatDate(content.created_at)}
            </p>
          </header>
          <p className="text-red-600">Não foi possível exibir este conteúdo.</p>
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
