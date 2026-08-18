import Link from "next/link";
import { CheckIcon, LockIcon } from "@/components/icons";

type LessonRowProps = {
  href: string;
  lessonInModule: number;
  title: string;
  duration?: string;
  completed: boolean;
  locked?: boolean;
};

export function LessonRow({
  href,
  lessonInModule,
  title,
  duration,
  completed,
  locked = false,
}: LessonRowProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[44px] items-center gap-3 rounded-xl border border-card-border bg-card px-3 py-2.5 active:bg-card-active"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card-active font-mono text-xs font-semibold text-muted">
        {String(lessonInModule).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug text-foreground">{title}</span>
        {duration && <span className="text-xs text-muted">{duration}</span>}
      </span>
      {locked ? (
        <LockIcon className="h-4 w-4 shrink-0 text-muted" aria-label="Disponível no Pregue Melhor Pro" />
      ) : (
        completed && (
          <CheckIcon className="h-5 w-5 shrink-0 text-accent" aria-label="Aula concluída" />
        )
      )}
    </Link>
  );
}
