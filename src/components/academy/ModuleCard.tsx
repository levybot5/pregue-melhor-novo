import Link from "next/link";
import { ProgressBar } from "./ProgressBar";

type ModuleCardProps = {
  href: string;
  moduleId: number;
  title: string;
  lessonCount: number;
  durationLabel: string;
  completedCount: number;
};

export function ModuleCard({
  href,
  moduleId,
  title,
  lessonCount,
  durationLabel,
  completedCount,
}: ModuleCardProps) {
  const percent = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;
  const isComplete = completedCount >= lessonCount && lessonCount > 0;
  const isStarted = completedCount > 0;

  const ctaLabel = isComplete ? "Concluído ✓" : isStarted ? "Continuar" : "Começar";

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-sm font-semibold text-accent">
            {String(moduleId).padStart(2, "0")}
          </span>
          <h3 className="text-base font-semibold leading-snug text-foreground">{title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted">
        {lessonCount} aulas • {durationLabel}
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted">
          {completedCount} de {lessonCount} concluídas
        </p>
        <ProgressBar percent={percent} />
      </div>

      <span
        className={`mt-1 flex min-h-[40px] items-center justify-center rounded-xl px-4 text-sm font-semibold ${
          isComplete
            ? "bg-card-active text-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {ctaLabel}
      </span>
    </Link>
  );
}
