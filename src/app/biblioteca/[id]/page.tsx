import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getContentById } from "@/services/database";
import {
  sermonContentSchema,
  bibleStudyContentSchema,
  outlineExpansionContentSchema,
  pulpitOutlineContentSchema,
  sermonOutlineContentSchema,
  aulaBiblicaContentSchema,
} from "@/services/ai";
import { SermonView } from "@/components/SermonView";
import { BibleStudyView } from "@/components/BibleStudyView";
import { OutlineExpansionView } from "@/components/OutlineExpansionView";
import { PulpitOutlineView } from "@/components/PulpitOutlineView";
import { SermonOutlineView } from "@/components/SermonOutlineView";
import { AulaBiblicaView } from "@/components/AulaBiblicaView";
import { ContentToolbar } from "@/components/ContentToolbar";
import { ReadingHeader } from "@/components/reading";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
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

function renderByType(type: string, raw: Record<string, unknown>, title: string, id: string) {
  const deletable = { contentId: id };

  switch (type) {
    case "pregacao": {
      const parsed = sermonContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ReadingHeader title={parsed.data.titulo} />
          <SermonView sermon={parsed.data} />
          <ContentToolbar
            contentType="pregacao"
            content={parsed.data}
            title={title}
            deletable={deletable}
          />
        </>
      );
    }
    case "biblia_explicada": {
      const parsed = bibleStudyContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ReadingHeader title={parsed.data.titulo} />
          <BibleStudyView study={parsed.data} />
          <ContentToolbar
            contentType="biblia_explicada"
            content={parsed.data}
            title={title}
            deletable={deletable}
          />
        </>
      );
    }
    case "esboco_pregacao": {
      const parsed = outlineExpansionContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ReadingHeader title={parsed.data.titulo} />
          <OutlineExpansionView content={parsed.data} />
          <ContentToolbar
            contentType="esboco_pregacao"
            content={parsed.data}
            title={title}
            deletable={deletable}
          />
        </>
      );
    }
    case "esboco_pulpito": {
      // Formato novo ("Pregação para Esboço") é o único gerado a
      // partir de agora — tenta primeiro. Se não bater (conteúdo
      // salvo antes da mudança), cai para o formato antigo, para
      // continuar abrindo normalmente sem migration.
      const parsedNew = sermonOutlineContentSchema.safeParse(raw);
      if (parsedNew.success) {
        return (
          <>
            <ReadingHeader title={parsedNew.data.titulo} />
            <SermonOutlineView outline={parsedNew.data} />
            <ContentToolbar
              contentType="esboco_pulpito"
              content={parsedNew.data}
              title={title}
              deletable={deletable}
            />
          </>
        );
      }
      const parsedOld = pulpitOutlineContentSchema.safeParse(raw);
      if (!parsedOld.success) return null;
      return (
        <>
          <ReadingHeader title={parsedOld.data.tema} />
          <PulpitOutlineView outline={parsedOld.data} />
          <ContentToolbar
            contentType="esboco_pulpito_legacy"
            content={parsedOld.data}
            title={title}
            deletable={deletable}
          />
        </>
      );
    }
    case "aula_biblica": {
      const parsed = aulaBiblicaContentSchema.safeParse(raw);
      if (!parsed.success) return null;
      return (
        <>
          <ReadingHeader title={parsed.data.titulo} />
          <AulaBiblicaView aula={parsed.data} />
          <ContentToolbar
            contentType="aula_biblica"
            content={parsed.data}
            title={title}
            deletable={deletable}
          />
        </>
      );
    }
    // Devocional não tem rota de detalhe persistente — não é salvo na
    // Biblioteca. Se existir algum registro antigo com este tipo, cai
    // no fallback genérico abaixo (título + "não foi possível exibir").
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
      <>
        <AppHeader backHref="/biblioteca" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
          <p className="text-red-600">Não foi possível carregar este conteúdo agora.</p>
          <Link
            href="/biblioteca"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Voltar para a Biblioteca
          </Link>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!content) {
    notFound();
  }

  const rendered = renderByType(content.type, content.content, content.title, content.id);

  return (
    <>
      <AppHeader backHref="/biblioteca" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
        {rendered ? (
          <>
            <p className="-mt-2 text-xs text-muted">{formatDate(content.created_at)}</p>
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
      </main>
      <BottomNav />
    </>
  );
}
