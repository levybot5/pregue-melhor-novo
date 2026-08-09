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
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
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
