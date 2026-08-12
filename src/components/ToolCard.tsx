import Link from "next/link";
import type { ReactNode } from "react";

type ToolCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

export function ToolCard({ href, title, description, icon }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[92px] items-center gap-4 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card-active text-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">
          {description}
        </span>
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

type ComingSoonToolCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

// Ferramenta anunciada no layout mas ainda não construída — sem link,
// sem clique, só o card com um selo "Em breve".
export function ComingSoonToolCard({ title, description, icon }: ComingSoonToolCardProps) {
  return (
    <div
      aria-disabled="true"
      className="flex min-h-[92px] items-center gap-4 rounded-2xl border border-card-border bg-card p-4 opacity-60"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card-active text-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">
          {description}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-card-active px-2.5 py-1 text-xs font-medium text-muted">
        Em breve
      </span>
    </div>
  );
}

type HeroToolCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  cta: string;
};

// Ação principal da Home — mesmo card das ferramentas, mas em
// destaque: ícone em dourado e botão em pílula no lugar do chevron.
export function HeroToolCard({ href, title, description, icon, cta }: HeroToolCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">
          {description}
        </span>
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
    </Link>
  );
}
