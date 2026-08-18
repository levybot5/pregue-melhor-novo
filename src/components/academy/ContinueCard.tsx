import Link from "next/link";

type ContinueCardProps = {
  href: string;
  moduleTitle: string;
  lessonInModule: number;
  lessonTitle: string;
};

export function ContinueCard({
  href,
  moduleTitle,
  lessonInModule,
  lessonTitle,
}: ContinueCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-accent">
        Continuar estudando
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold text-foreground">{moduleTitle}</p>
        <p className="truncate text-sm text-muted">
          Aula {String(lessonInModule).padStart(2, "0")} — {lessonTitle}
        </p>
      </div>
      <span className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
        Continuar
      </span>
    </Link>
  );
}
