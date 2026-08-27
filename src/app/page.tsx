import Image from "next/image";
import Link from "next/link";
import { ToolCoverCard } from "@/components/home/ToolCoverCard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { BottomNav } from "@/components/home/BottomNav";
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
  ChalkboardIcon,
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

export default async function Home() {
  const user = await getCurrentUser();
  // Uma única consulta extra, só quando logado — nada de polling nem
  // de repetir isso em outras páginas.
  const profile = user ? await getProfile(user.id) : null;
  const firstName = profile?.name?.trim().split(/\s+/)[0];
  const greeting = firstName || user?.email;
  const avatarInitial = (greeting ?? "?").charAt(0).toUpperCase();
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
    // Fundo escuro só desta página — nenhum token global tocado, nenhuma
    // outra rota é afetada. min-h-dvh evita qualquer flash do fundo
    // claro do <body> (ver src/app/globals.css, não editado).
    <div className="min-h-dvh bg-[#07101F]">
      <header className="bg-[#07101F]">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] lg:max-w-[1100px] lg:px-8">
          <span className="flex items-center gap-2">
            <Image
              src="/brand/icon-source.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <span className="text-base font-bold tracking-tight text-white">Pregue Melhor</span>
          </span>

          {user ? (
            <span className="flex items-center gap-3">
              {/* Mobile: só o avatar (sem e-mail longo). Desktop: nome/e-mail
                  volta a aparecer, mesma variável `greeting` de sempre. */}
              <span className="hidden text-sm text-slate-300 lg:inline">{greeting}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                {avatarInitial}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-xs font-medium text-slate-400 underline underline-offset-4"
                >
                  Sair
                </button>
              </form>
            </span>
          ) : (
            <Link href="/cadastrar" className="text-sm font-medium text-white underline underline-offset-4">
              Cadastrar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-2 lg:max-w-[1100px] lg:gap-10 lg:px-8 lg:pb-10 lg:pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-8 lg:gap-y-4">
          <div className="flex flex-col gap-0.5 lg:order-1">
            <h1 className="text-xl font-bold tracking-tight text-white lg:text-3xl">
              Prepare-se melhor para pregar.
            </h1>
            <p className="text-sm text-slate-400 lg:text-base">Do estudo da Palavra ao púlpito.</p>
          </div>

          <div className="empty:hidden lg:order-3 lg:basis-full">
            <InstallPwaBanner />
          </div>

          {/* Discreto de propósito — informação de conta, não uma ação
              da home. Mesma árvore de decisão de antes, só reestilizada. */}
          <div className="flex flex-col gap-2 text-xs lg:order-2 lg:w-auto lg:min-w-[280px] lg:items-end lg:text-right lg:text-sm">
            {generationStatus?.subscriptionActive ? (
              <>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Pregue Melhor Pro</span>
                  <GenerationCounter
                    remaining={generationStatus.dailyRemaining}
                    className="text-xs text-slate-400 lg:text-sm"
                  />
                </div>
                {showRenewalReminder && (
                  <div className="flex items-center gap-2 text-accent">
                    <span>
                      Vence em {daysUntilExpiry} {daysUntilExpiry === 1 ? "dia" : "dias"}.
                    </span>
                    <Link href="/planos/pagar" className="font-semibold underline underline-offset-4">
                      Renovar
                    </Link>
                  </div>
                )}
              </>
            ) : (
              trialRemaining !== null && (
                <div className="flex items-center gap-3">
                  <TrialCounter
                    remaining={trialRemaining}
                    className="text-xs text-slate-400 lg:text-sm"
                  />
                  <TrialSubscribeButton />
                </div>
              )
            )}
          </div>
        </div>

        <ToolCoverCard
          href="/pregacao"
          title="Criar Pregação"
          description="Tema ou versículo em Pregação completa."
          icon={<MessageIcon />}
          coverImage="/home/criar-pregacao-v2.jpg"
          coverPosition="center 20%"
          size="featured"
          ctaLabel="Começar agora"
        />

        <section className="flex flex-col gap-3">
          <SectionHeader title="Ferramentas" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            <ToolCoverCard
              href="/esboco-pregacao"
              title="Esboço em Pregação"
              description="Transforme suas ideias em uma mensagem estruturada."
              icon={<TransformIcon />}
              coverImage="/home/esboco-pregacao.jpg"
              coverPosition="center 15%"
            />
            <ToolCoverCard
              href="/esboco-pulpito"
              title="Pregação para Esboço"
              description="Transforme uma pregação completa em um esboço claro e fácil de acompanhar no púlpito."
              icon={<ListIcon />}
              coverImage="/home/esboco-pulpito.jpg"
            />
            <ToolCoverCard
              href="/biblia"
              title="Bíblia Explicada"
              description="Entenda uma passagem bíblica com clareza."
              icon={<OpenBookIcon />}
              coverImage="/home/biblia-explicada.png"
            />
            <ToolCoverCard
              href="/dicionario"
              title="Dicionário Bíblico"
              description="Pesquise termos, lugares e personagens da Bíblia."
              icon={<SearchIcon />}
              coverImage="/home/dicionario-biblico.jpg"
            />
            <ToolCoverCard
              href="/aula-biblica"
              title="Criar Aula Bíblica"
              description="Prepare aulas para EBD, células e pequenos grupos."
              icon={<ChalkboardIcon />}
              coverImage="/home/aula-biblica.jpg"
              coverPosition="center 15%"
            />
            <ToolCoverCard
              href="/devocional"
              title="Devocional"
              description="Reflexão para vida e ministério."
              icon={<HeartIcon />}
              coverImage="/home/devocional.jpg"
            />
            <ToolCoverCard
              href="/esbocos-prontos"
              title="Esboços Prontos"
              description="Estruturas objetivas para preparar sua mensagem com mais rapidez."
              icon={<ClipboardListIcon />}
              coverImage="/home/esbocos-prontos.jpg"
            />
            <ToolCoverCard
              href="/pregacoes-prontas"
              title="Pregações Prontas"
              description="Mensagens completas para estudar, adaptar e ministrar."
              icon={<StarIcon />}
              coverImage="/home/pregacoes-prontas.jpg"
            />
            <ToolCoverCard
              href="/academia"
              title="Academia do Pregador"
              description="Cursos e formação para desenvolver sua pregação e conhecimento bíblico."
              icon={<GraduationCapIcon />}
              coverImage="/home/academia-pregador.jpg"
            />
            <ToolCoverCard
              href="/biblioteca"
              title="Minha Biblioteca"
              description="Suas mensagens salvas."
              icon={<LibraryIcon />}
              coverImage="/home/biblioteca.jpg"
            />
          </div>
        </section>

        <p className="text-center text-xs text-slate-500">
          Pregue Melhor é um apoio para sua preparação — não substitui o cuidado pastoral nem o
          estudo pessoal da Palavra.
        </p>
        <Link
          href="/privacidade"
          className="text-center text-xs text-slate-500 underline underline-offset-4"
        >
          Política de Privacidade
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
