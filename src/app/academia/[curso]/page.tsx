import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getCourseProgress } from "@/services/academy";
import { ACADEMY_COURSE, listModules } from "@/lib/academy/course-data";
import { ProgressBar } from "@/components/academy/ProgressBar";
import { ModuleCard } from "@/components/academy/ModuleCard";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";

export const dynamic = "force-dynamic";

export default async function AcademiaCoursePage({
  params,
}: {
  params: Promise<{ curso: string }>;
}) {
  const { curso } = await params;
  if (curso !== ACADEMY_COURSE.id) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/academia/${curso}`);
  }

  const progress = await getCourseProgress(user.id, ACADEMY_COURSE.id);
  const completedCount = progress.filter((p) => p.completedAt).length;
  const percent =
    ACADEMY_COURSE.totalLessons > 0 ? (completedCount / ACADEMY_COURSE.totalLessons) * 100 : 0;

  const completedByModule = new Map<number, number>();
  for (const p of progress) {
    if (!p.completedAt) continue;
    completedByModule.set(p.moduleId, (completedByModule.get(p.moduleId) ?? 0) + 1);
  }

  return (
    <>
      <AppHeader backHref="/academia" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {ACADEMY_COURSE.title}
        </h1>
        <p className="text-muted">{ACADEMY_COURSE.channel}</p>
        <p className="text-sm text-muted">
          {ACADEMY_COURSE.totalLessons} aulas • {ACADEMY_COURSE.totalModules} módulos •{" "}
          {ACADEMY_COURSE.durationLabel}
        </p>
      </header>

      <div className="flex flex-col gap-1.5 rounded-2xl border border-card-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Seu progresso</span>
          <span className="text-muted">{Math.round(percent)}%</span>
        </div>
        <ProgressBar percent={percent} />
        <p className="text-xs text-muted">
          {completedCount} de {ACADEMY_COURSE.totalLessons} aulas concluídas
        </p>
      </div>

      <section className="flex flex-col gap-3">
        {listModules().map((mod) => (
          <ModuleCard
            key={mod.id}
            href={`/academia/${curso}/${String(mod.id).padStart(2, "0")}`}
            moduleId={mod.id}
            title={mod.title}
            lessonCount={mod.lessonCount}
            durationLabel={mod.durationLabel}
            completedCount={completedByModule.get(mod.id) ?? 0}
          />
        ))}
      </section>

      <p className="text-center text-xs text-muted">
        Conteúdo original de {ACADEMY_COURSE.channel} no YouTube.
      </p>
      </main>
      <BottomNav />
    </>
  );
}
