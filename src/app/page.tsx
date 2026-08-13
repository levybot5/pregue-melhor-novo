import Link from "next/link";
import { ToolCard, HeroToolCard } from "@/components/ToolCard";
import {
  ListIcon,
  LibraryIcon,
  MessageIcon,
  OpenBookIcon,
  TransformIcon,
  StarIcon,
  ClipboardListIcon,
  HeartIcon,
  LifebuoyIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/services/auth";
import { getProfile } from "@/services/database";
import { getGenerationStatus } from "@/services/billing";
import { GenerationCounter } from "@/components/GenerationCounter";
import { signOutAction } from "./actions";

const tools = [
  {
    href: "/esboco-pregacao",
    title: "Esboço em Pregação",
    description: "Transforme suas ideias em uma mensagem estruturada.",
    icon: <TransformIcon className="h-6 w-6" />,
  },
  {
    href: "/biblia",
    title: "Bíblia Explicada",
    description: "Entenda uma passagem bíblica com clareza.",
    icon: <OpenBookIcon className="h-6 w-6" />,
  },
  {
    href: "/esboco-pulpito",
    title: "Pregação para Esboço",
    description: "Transforme uma pregação completa em um esboço claro e fácil de acompanhar no púlpito.",
    icon: <ListIcon className="h-6 w-6" />,
  },
] as const;

const readyContentTools = [
  {
    href: "/esbocos-prontos",
    title: "Esboços Prontos",
    description: "Estruturas objetivas para preparar sua mensagem com mais rapidez.",
    icon: <ClipboardListIcon className="h-6 w-6" />,
  },
  {
    href: "/pregacoes-prontas",
    title: "Pregações Prontas",
    description: "Mensagens completas para estudar, adaptar e ministrar.",
    icon: <StarIcon className="h-6 w-6" />,
  },
] as const;

export default async function Home() {
  const user = await getCurrentUser();
  // Uma única consulta extra, só quando logado — nada de polling nem
  // de repetir isso em outras páginas.
  const profile = user ? await getProfile(user.id) : null;
  const firstName = profile?.name?.trim().split(/\s+/)[0];
  const greeting = firstName || user?.email;
  const generationStatus = user ? await getGenerationStatus(user.id) : null;

  return (
    <>
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <span className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-accent-foreground">
              P
            </span>
            <span className="text-lg font-bold tracking-tight">Pregue Melhor</span>
          </span>

          {user ? (
            <span className="flex items-center gap-3 text-sm">
              <span className="text-primary-foreground/80">{greeting}</span>
              <form action={signOutAction}>
                <button type="submit" className="font-medium underline underline-offset-4">
                  Sair
                </button>
              </form>
            </span>
          ) : (
            <Link href="/entrar" className="text-sm font-medium underline underline-offset-4">
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-6">
        <p className="text-muted">Prepare sua mensagem com mais clareza.</p>

        {generationStatus?.subscriptionActive && (
          <div className="flex items-center justify-between rounded-2xl border border-card-border bg-card px-4 py-3">
            <span className="text-sm font-medium text-foreground">Pregue Melhor Pro</span>
            <GenerationCounter remaining={generationStatus.dailyRemaining} />
          </div>
        )}

        <HeroToolCard
          href="/pregacao"
          title="Criar Pregação"
          description="Tema ou versículo em Pregação completa."
          icon={<MessageIcon className="h-6 w-6" />}
          cta="Começar"
        />

        <div className="flex flex-col gap-3">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}

          <ToolCard
            href="/devocional"
            title="Devocional"
            description="Reflexão para vida e ministério."
            icon={<HeartIcon className="h-6 w-6" />}
          />

          {readyContentTools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}

          <ToolCard
            href="/apoio-do-pregador"
            title="Apoio do Pregador"
            description="Curso, guias e materiais de apoio."
            icon={<LifebuoyIcon className="h-6 w-6" />}
          />

          <ToolCard
            href="/biblioteca"
            title="Minha Biblioteca"
            description="Suas mensagens salvas."
            icon={<LibraryIcon className="h-6 w-6" />}
          />
        </div>

        <p className="text-center text-xs text-muted">
          Pregue Melhor é um apoio para sua preparação — não substitui o cuidado pastoral nem o
          estudo pessoal da Palavra.
        </p>
      </main>
    </>
  );
}
