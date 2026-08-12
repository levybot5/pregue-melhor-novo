import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";

export const dynamic = "force-dynamic";

// Todo o conteúdo desta página é curadoria nossa (vídeos e PDFs já
// prontos) — nenhuma chamada de IA, nenhum link é inventado ou
// buscado, todos vieram diretamente do pedido do usuário.
const LESSONS = [
  { number: 1, title: "Início do Curso", url: "https://youtu.be/NoT85GMSciE" },
  { number: 2, title: "Introdução ao Curso", url: "https://youtu.be/wovKYZ9Ke9Q" },
  { number: 3, title: "Interpretação da Bíblia", url: "https://youtu.be/sYzE2WM_EV4" },
  { number: 4, title: "Contexto Histórico", url: "https://youtu.be/AB6FKRiX6_E" },
  { number: 5, title: "Tábua Periódica Bíblica", url: "https://youtu.be/2fJhsWaMASo" },
  { number: 6, title: "O Pregador do Evangelho", url: "https://youtu.be/tJBRxsom-hg" },
  { number: 7, title: "Qualidades de um Bom Pregador", url: "https://youtu.be/615w3ZZIPkM" },
  { number: 8, title: "Coisas que um Pregador Não Deve Fazer", url: "https://youtu.be/rsRyQl2Dco0" },
  { number: 9, title: "Quem Deve Pregar", url: "https://youtu.be/m0n391DYnhA" },
  { number: 10, title: "Vou Pregar, o Que Devo Fazer?", url: "https://youtu.be/sjugZvTrN_U" },
  { number: 11, title: "Como Montar uma Pregação", url: "https://youtu.be/HUQbkrgVpiA" },
  { number: 12, title: "Divisão Básica do Sermão", url: "https://youtu.be/nBV5cQLjgJc" },
  { number: 13, title: "Classificação de Sermão", url: "https://youtu.be/a41rb9fHT8M" },
  { number: 14, title: "Sermão Temático", url: "https://youtu.be/3bmXifzXHA8" },
  { number: 15, title: "Sermão Textual", url: "https://youtu.be/aQoRTQd6G18" },
  { number: 16, title: "Sermão Expositivo", url: "https://youtu.be/uly0nBMkDkM" },
  { number: 17, title: "Método de Preparação de Sermão", url: "https://youtu.be/i63ik65Cewg" },
  { number: 18, title: "Pregação na Prática", url: "https://youtu.be/uewJUvCmo8g" },
  { number: 19, title: "Como Vencer a Timidez", url: "https://youtu.be/nLT1zGxkIDI" },
  { number: 20, title: "Investimento Ministerial", url: "https://youtu.be/pXbKKrQnkFo" },
] as const;

const MATERIALS = [
  {
    title: "Pregue com Segurança",
    url: "https://drive.google.com/file/d/17HQFUQ4yFFpUAoOBOMnMBqVDt5v1NI5P/view?usp=sharing",
  },
  {
    title: "Guia Prático Para Preparar seus Sermões",
    url: "https://drive.google.com/file/d/16BhkzurwNBC3ynnaIj8ZLHZgnwfzfVs1/view?usp=sharing",
  },
  {
    title: "Como Interpretar a Bíblia",
    url: "https://drive.google.com/file/d/1dhIwJRtyHn4ETjRa69uHDFPB6tWgqGRC/view?usp=sharing",
  },
] as const;

function ExternalLinkCard({
  eyebrow,
  title,
  url,
  cta,
}: {
  eyebrow?: string;
  title: string;
  url: string;
  cta: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
    >
      <span className="min-w-0 flex-1">
        {eyebrow && <span className="block text-xs font-medium text-muted">{eyebrow}</span>}
        <span className="block text-base font-semibold text-foreground">{title}</span>
      </span>
      <span className="flex min-h-[40px] shrink-0 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
        {cta}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  );
}

export default async function ApoioDoPregadorPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/apoio-do-pregador");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Apoio do Pregador
        </h1>
        <p className="text-muted">Curso, guias e materiais de apoio.</p>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-foreground">
            Curso Pregação Sem Enrolação
          </h2>
          <p className="text-sm text-muted">
            Aulas práticas para aprender a preparar, organizar e ministrar melhor suas mensagens.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {LESSONS.map((lesson) => (
            <ExternalLinkCard
              key={lesson.number}
              eyebrow={`Aula ${lesson.number}`}
              title={lesson.title}
              url={lesson.url}
              cta="Assistir aula"
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Materiais em PDF</h2>

        <div className="flex flex-col gap-3">
          {MATERIALS.map((material) => (
            <ExternalLinkCard
              key={material.title}
              title={material.title}
              url={material.url}
              cta="Abrir PDF"
            />
          ))}
        </div>
      </section>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
