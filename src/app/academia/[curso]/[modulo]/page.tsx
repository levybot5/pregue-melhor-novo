import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { isSubscriptionActive } from "@/services/billing/subscription";
import { getCourseProgress } from "@/services/academy";
import { ACADEMY_COURSE, getModule, listModuleLessons } from "@/lib/academy/course-data";
import { ProgressBar } from "@/components/academy/ProgressBar";
import { LessonRow } from "@/components/academy/LessonRow";
import { BackLink } from "@/components/reading";

export const dynamic = "force-dynamic";

export default async function AcademiaModulePage({
  params,
}: {
  params: Promise<{ curso: string; modulo: string }>;
}) {
  const { curso, modulo } = await params;
  if (curso !== ACADEMY_COURSE.id) {
    notFound();
  }

  const moduleId = Number(modulo);
  const mod = getModule(moduleId);
  if (!mod) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/academia/${curso}/${modulo}`);
  }

  const [progress, hasProAccess] = await Promise.all([
    getCourseProgress(user.id, ACADEMY_COURSE.id),
    isSubscriptionActive(user.id),
  ]);

  const completedLessonIds = new Set(
    progress.filter((p) => p.completedAt && p.moduleId === moduleId).map((p) => p.lessonId),
  );
  const lessons = listModuleLessons(moduleId);
  const completedCount = lessons.filter((l) => completedLessonIds.has(l.lessonNumber)).length;
  const percent = mod.lessonCount > 0 ? (completedCount / mod.lessonCount) * 100 : 0;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <BackLink href={`/academia/${curso}`} label="Curso Básico de Teologia" />

      <header className="flex flex-col gap-1">
        <span className="font-mono text-sm font-semibold text-accent">
          {String(mod.id).padStart(2, "0")}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{mod.title}</h1>
        <p className="text-muted">{mod.description}</p>
        <p className="text-sm text-muted">
          {mod.lessonCount} aulas • {mod.durationLabel}
        </p>
      </header>

      <div className="flex flex-col gap-1.5 rounded-2xl border border-card-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Progresso</span>
          <span className="text-muted">
            {completedCount}/{mod.lessonCount}
          </span>
        </div>
        <ProgressBar percent={percent} />
      </div>

      {!hasProAccess && (
        <div className="rounded-2xl border border-card-border bg-card-active p-4 text-sm text-foreground">
          Você está vendo uma prévia da Academia. Assine o Pregue Melhor Pro para assistir às
          aulas.
        </div>
      )}

      <section className="flex flex-col gap-2">
        {lessons.map((lesson) => (
          <LessonRow
            key={lesson.lessonNumber}
            href={`/academia/${curso}/${modulo}/${String(lesson.lessonInModule).padStart(2, "0")}`}
            lessonInModule={lesson.lessonInModule}
            title={lesson.title}
            duration={lesson.duration}
            completed={completedLessonIds.has(lesson.lessonNumber)}
            locked={!hasProAccess}
          />
        ))}
      </section>

      <p className="text-center text-xs text-muted">
        Conteúdo original de {ACADEMY_COURSE.channel} no YouTube.
      </p>
    </main>
  );
}
