import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { isSubscriptionActive } from "@/services/billing/subscription";
import { getCourseProgress, recordLessonWatched } from "@/services/academy";
import {
  PSE_COURSE,
  PSE_MODULE_ID,
  getPseLesson,
  getPseAdjacentLessons,
  getPseEmbedUrl,
  getPseWatchUrl,
  type PseLesson,
} from "@/lib/academy/pse-course-data";
import { BackLink } from "@/components/reading";
import { LessonCompleteButton } from "@/components/academy/LessonCompleteButton";

export const dynamic = "force-dynamic";

function lessonHref(target: PseLesson | null): string | null {
  if (!target) return null;
  return `/academia/pregacao-sem-enrolacao/${String(target.lessonNumber).padStart(2, "0")}`;
}

export default async function PseLessonPage({
  params,
}: {
  params: Promise<{ aula: string }>;
}) {
  const { aula } = await params;
  const lessonNumber = Number(aula);
  const lesson = getPseLesson(lessonNumber);
  if (!lesson) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?redirectTo=/academia/pregacao-sem-enrolacao/${aula}`);
  }

  const hasProAccess = await isSubscriptionActive(user.id);

  // Sem assinatura ativa: prévia termina aqui — CTA do Pro em vez do
  // player, sem carregar nenhum iframe do YouTube.
  if (!hasProAccess) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <BackLink href="/academia/pregacao-sem-enrolacao" label="Voltar para o curso" />

        <header className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-muted">{PSE_COURSE.title}</p>
          <h1 className="text-xl font-bold leading-snug tracking-tight text-foreground">
            {lesson.title}
          </h1>
        </header>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-card-border bg-card p-6 text-center">
          <p className="text-foreground">
            Essa aula faz parte do Pregue Melhor Pro. Assine para assistir a todo o{" "}
            {PSE_COURSE.title}.
          </p>
          <Link
            href="/planos"
            className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground"
          >
            Assinar Pregue Melhor Pro
          </Link>
        </div>
      </main>
    );
  }

  await recordLessonWatched(user.id, PSE_COURSE.id, PSE_MODULE_ID, lesson.lessonNumber);

  const progress = await getCourseProgress(user.id, PSE_COURSE.id);
  const isCompleted = progress.some(
    (p) => p.lessonId === lesson.lessonNumber && Boolean(p.completedAt),
  );

  const { previous, next } = getPseAdjacentLessons(lesson.lessonNumber);
  const previousHref = lessonHref(previous);
  const nextHref = lessonHref(next);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <BackLink href="/academia/pregacao-sem-enrolacao" label="Voltar para o curso" />

      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-muted">{PSE_COURSE.title}</p>
        <p className="text-xs text-muted">
          Aula {String(lesson.lessonNumber).padStart(2, "0")} de {PSE_COURSE.totalLessons}
        </p>
        <h1 className="text-xl font-bold leading-snug tracking-tight text-foreground">
          {lesson.title}
        </h1>
      </header>

      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          key={lesson.lessonNumber}
          src={getPseEmbedUrl(lesson.youtubeVideoId)}
          title={lesson.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>Conteúdo original no YouTube</span>
        <a
          href={getPseWatchUrl(lesson.youtubeVideoId)}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline underline-offset-4"
        >
          Assistir no YouTube ↗
        </a>
      </div>

      <LessonCompleteButton
        courseId={PSE_COURSE.id}
        moduleId={PSE_MODULE_ID}
        lessonId={lesson.lessonNumber}
        initialCompleted={isCompleted}
      />

      <div className="flex items-center justify-between gap-3">
        {previousHref ? (
          <Link
            href={previousHref}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-card-border px-4 text-sm font-medium text-foreground"
          >
            ← Anterior
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-card-border px-4 text-sm font-medium text-foreground"
          >
            Próxima aula →
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </div>
    </main>
  );
}
