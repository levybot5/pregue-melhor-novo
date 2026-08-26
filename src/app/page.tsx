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
  GraduationCapIcon,
  SearchIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/services/auth";
import { getProfile } from "@/services/database";
import {
  getGenerationStatus,
  getTrialRemaining,
  getCurrentSubscription,
  getDaysUntilExpiry,
} from "@/services/billing";
import { GenerationCounter } from "@/components/GenerationCounter";
import { TrialCounter } from "@/components/TrialCounter";
import { TrialSubscribeButton } from "@/components/TrialSubscribeButton";
import { InstallPwaBanner } from "@/components/InstallPwaBanner";
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
    href: "/dicionario",
    title: "Dicionário Bíblico",
    description: "Pesquise termos, lugares e personagens da Bíblia.",
    icon: <SearchIcon className="h-6 w-6" />,
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
  // Anônimo OU logado sem Pro: mesmo trial por device_id (nunca reinicia
  // por login/logout — ver services/billing/trial.ts).
  const trialRemaining = generationStatus?.subscriptionActive
    ? null
    : await getTrialRemaining();

  // Só faz sentido lembrar de renovar quem é PIX — cartão renova
  // sozinho (item 8 do pedido de checkout Asaas). Discreto: só aparece
  // nos últimos 5 dias, nunca cobra automaticamente por conta própria.
  const subscription = generationStatus?.subscriptionActive && user
    ? await getCurrentSubscription(user.id)
    : null;
  const daysUntilExpiry = getDaysUntilExpiry(subscription);
  const showRenewalReminder =
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 5;

  return (
    <>
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] lg:max-w-[1100px] lg:px-8">
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
            <Link href="/cadastrar" className="text-sm font-medium underline underline-offset-4">
              Cadastrar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-6 lg:max-w-[1100px] lg:px-8 lg:gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-8 lg:gap-y-4">
          <p className="text-muted lg:order-1 lg:pt-2">Prepare sua mensagem com mais clareza.</p>

          <div className="empty:hidden lg:order-3 lg:basis-full">
            <InstallPwaBanner />
          </div>

          <div className="flex flex-col gap-3 lg:order-2 lg:w-auto lg:min-w-[320px]">
            {generationStatus?.subscriptionActive ? (
              <>
                <div className="flex items-center justify-between rounded-2xl border border-card-border bg-card px-4 py-3">
                  <span className="text-sm font-medium text-foreground">Pregue Melhor Pro</span>
                  <GenerationCounter remaining={generationStatus.dailyRemaining} />
                </div>
                {showRenewalReminder && (
                  <div className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3">
                    <span className="text-sm text-foreground">
                      Seu acesso vence em {daysUntilExpiry} {daysUntilExpiry === 1 ? "dia" : "dias"}.
                    </span>
                    <Link
                      href="/planos/pagar"
                      className="text-sm font-semibold text-accent underline underline-offset-4"
                    >
                      Renovar
                    </Link>
                  </div>
                )}
              </>
            ) : (
              trialRemaining !== null && (
                <div className="flex items-center justify-between rounded-2xl border border-card-border bg-card px-4 py-3">
                  <TrialCounter remaining={trialRemaining} className="text-sm font-medium text-foreground" />
                  <TrialSubscribeButton />
                </div>
              )
            )}
          </div>
        </div>

        <HeroToolCard
          href="/pregacao"
          title="Criar Pregação"
          description="Tema ou versículo em Pregação completa."
          icon={<MessageIcon className="h-6 w-6" />}
          cta="Começar"
        />

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
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
            href="/academia"
            title="Academia do Pregador"
            description="Cursos e formação para desenvolver sua pregação e conhecimento bíblico."
            icon={<GraduationCapIcon className="h-6 w-6" />}
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
        <Link
          href="/privacidade"
          className="text-center text-xs text-muted underline underline-offset-4"
        >
          Política de Privacidade
        </Link>
      </main>
    </>
  );
}
