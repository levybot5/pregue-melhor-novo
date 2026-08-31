import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type ToolCoverCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  // Caminho em /public — opcional de propósito: ferramentas sem foto
  // ainda usam o fallback gradiente+ícone abaixo, nunca uma imagem
  // inventada. Basta adicionar o arquivo depois pra ativar a capa real,
  // sem mexer neste componente.
  coverImage?: string;
  // Ponto focal do corte (object-position) — "center" (padrão) serve
  // pra maioria, mas fotos de retrato cortadas num formato bem
  // panorâmico (o card "featured") podem precisar subir o foco pra não
  // cortar o rosto da pessoa.
  coverPosition?: string;
  // "featured" é só o card de Criar Pregação — capa mais alta, título
  // maior. Mesma estrutura, sem duplicar lógica.
  size?: "default" | "featured";
  // Só usado no featured — nos cards padrão o card inteiro já é
  // clicável, sem precisar de texto de call-to-action.
  ctaLabel?: string;
};

export function ToolCoverCard({
  href,
  title,
  description,
  icon,
  coverImage,
  coverPosition = "center",
  size = "default",
  ctaLabel = "Acessar",
}: ToolCoverCardProps) {
  const featured = size === "featured";

  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101B2D] transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 ${
        featured ? "lg:flex-row lg:items-stretch" : ""
      }`}
    >
      <div
        className={`relative w-full shrink-0 overflow-hidden ${
          featured ? "aspect-[4.5/1] lg:aspect-auto lg:w-[60%]" : "aspect-[4/3] lg:aspect-[3/2]"
        }`}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            sizes={
              featured
                ? "(min-width: 1024px) 60vw, 100vw"
                : "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
            }
            style={{ objectPosition: coverPosition }}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-[#0b1730]">
            <span className="text-white/40 [&>svg]:h-10 [&>svg]:w-10">{icon}</span>
          </div>
        )}

        {/* Indicador discreto de "é clicável" nos cards padrão — sem
            texto/botão grande ocupando espaço, só nos cards do grid
            (o featured já tem o CTA visível abaixo). */}
        {!featured && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col ${
          featured
            ? "gap-0.5 p-2.5 lg:flex-none lg:w-[40%] lg:justify-center lg:gap-2 lg:p-6"
            : "gap-1.5 px-2.5 py-2 lg:p-3"
        }`}
      >
        <div className={`flex items-center ${featured ? "gap-1.5" : "gap-2"}`}>
          <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300 [&>svg]:h-3.5 [&>svg]:w-3.5 ${featured ? "h-5 w-5 lg:h-7 lg:w-7" : "h-6 w-6"}`}
          >
            {icon}
          </span>
          <h3
            className={`line-clamp-2 font-bold tracking-tight text-white ${featured ? "text-sm lg:text-xl" : "text-sm leading-snug"}`}
          >
            {title}
          </h3>
        </div>
        {/* Descrição: só a partir do desktop nos cards padrão — no
            mobile o card vira um atalho visual (imagem + ícone + nome),
            sem descrição, pra caber mais ferramentas na tela. */}
        <p
          className={`text-slate-400 line-clamp-2 ${
            featured ? "hidden text-sm lg:block" : "hidden text-xs leading-snug lg:block"
          }`}
        >
          {description}
        </p>

        {featured && (
          <span className="mt-0.5 flex w-fit items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary-foreground lg:mt-2 lg:py-2 lg:text-sm">
            {ctaLabel}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        )}
      </div>
    </Link>
  );
}
