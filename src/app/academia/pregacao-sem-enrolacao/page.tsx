import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { isSubscriptionActive } from "@/services/billing/subscription";
import { getCourseProgress } from "@/services/academy";
import { PSE_COURSE, PSE_LESSONS } from "@/lib/academy/pse-course-data";
import { ProgressBar } from "@/components/academy/ProgressBar";
import { LessonRow } from "@/components/academy/LessonRow";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";

export const dynamic = "force-dynamic";

export default async function PregacaoSemEnrolacaoPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/academia/pregacao-sem-enrolacao");
  }

  const [progress, hasProAccess] = await Promise.all([
    getCourseProgress(user.id, PSE_COURSE.id),
    isSubscriptionActive(user.id),
  ]);

  const completedLessonIds = new Set(
    progress.filter((p) => p.completedAt).map((p) => p.lessonId),
  );
  const completedCount = PSE_LESSONS.filter((l) =>
    completedLessonIds.has(l.lessonNumber),
  ).length;
  const percent =
    PSE_COURSE.totalLessons > 0 ? (completedCount / PSE_COURSE.totalLessons) * 100 : 0;

  return (
    <>
      <AppHeader backHref="/academia" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{PSE_COURSE.title}</h1>
        <p className="text-muted">{PSE_COURSE.description}</p>
        <p className="text-sm text-muted">{PSE_COURSE.totalLessons} aulas</p>
      </header>

      <div className="flex flex-col gap-1.5 rounded-2xl border border-card-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Seu progresso</span>
          <span className="text-muted">{Math.round(percent)}%</span>
        </div>
        <ProgressBar percent={percent} />
        <p className="text-xs text-muted">
          {completedCount} de {PSE_COURSE.totalLessons} aulas concluídas
        </p>
      </div>

      {!hasProAccess && (
        <div className="rounded-2xl border border-card-border bg-card-active p-4 text-sm text-foreground">
          Você está vendo uma prévia da Academia. Assine o Pregue Melhor Pro para assistir às
          aulas.
        </div>
      )}

      <section className="flex flex-col gap-2">
        {PSE_LESSONS.map((lesson) => (
          <LessonRow
            key={lesson.lessonNumber}
            href={`/academia/pregacao-sem-enrolacao/${String(lesson.lessonNumber).padStart(2, "0")}`}
            lessonInModule={lesson.lessonNumber}
            title={lesson.title}
            completed={completedLessonIds.has(lesson.lessonNumber)}
            locked={!hasProAccess}
          />
        ))}
      </section>
      </main>
      <BottomNav />
    </>
  );
}
