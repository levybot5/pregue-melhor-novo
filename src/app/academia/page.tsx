import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getCourseProgress, getContinueLesson } from "@/services/academy";
import {
  ACADEMY_COURSE,
  getModule,
  getLessonByGlobalNumber,
} from "@/lib/academy/course-data";
import { PSE_COURSE, getPseLesson } from "@/lib/academy/pse-course-data";
import { GraduationCapIcon } from "@/components/icons";
import { BackLink } from "@/components/reading";
import { ContinueCard } from "@/components/academy/ContinueCard";
import { ExternalLinkCard } from "@/components/academy/ExternalLinkCard";

export const dynamic = "force-dynamic";

// Materiais em PDF — curadoria nossa, vinha da antiga página "Apoio do
// Pregador". Fica direto nesta tela (não atrás de um "Ver curso").
const SUPPORT_MATERIALS = [
  {
    title: "Pregue com Segurança",
    url: "https://drive.google.com/file/d/17HQFUQ4yFFpUAoOBOMnMBqVDt5v1NI5P/view?usp=sharing",
  },
  {
    title: "Guia Prático Para Preparar seus Sermões",
    url: "https://drive.google.com/file/d/16BhkzurwNBC3ynnaIj8ZLHZgnwfzfVs1/view?usp=sharing",
  },
  {
    title: "Como Interpretar a Bíblia",
    url: "https://drive.google.com/file/d/1dhIwJRtyHn4ETjRa69uHDFPB6tWgqGRC/view?usp=sharing",
  },
] as const;

// Resolve a aula mais recente (de qualquer um dos dois cursos) pro
// card "Continuar estudando" — cada curso tem seu próprio formato de
// identificar módulo/aula, então a resolução é feita aqui, não dentro
// do serviço de progresso (que não conhece o conteúdo dos cursos).
function resolveContinueCard(continueLesson: {
  courseId: string;
  moduleId: number;
  lessonId: number;
} | null) {
  if (!continueLesson) return null;

  if (continueLesson.courseId === ACADEMY_COURSE.id) {
    const lesson = getLessonByGlobalNumber(continueLesson.lessonId);
    const mod = getModule(continueLesson.moduleId);
    if (!lesson || !mod) return null;
    return {
      href: `/academia/${ACADEMY_COURSE.id}/${String(mod.id).padStart(2, "0")}/${String(
        lesson.lessonInModule,
      ).padStart(2, "0")}`,
      moduleTitle: mod.title,
      lessonInModule: lesson.lessonInModule,
      lessonTitle: lesson.title,
    };
  }

  if (continueLesson.courseId === PSE_COURSE.id) {
    const lesson = getPseLesson(continueLesson.lessonId);
    if (!lesson) return null;
    return {
      href: `/academia/pregacao-sem-enrolacao/${String(lesson.lessonNumber).padStart(2, "0")}`,
      moduleTitle: PSE_COURSE.title,
      lessonInModule: lesson.lessonNumber,
      lessonTitle: lesson.title,
    };
  }

  return null;
}

export default async function AcademiaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/academia");
  }

  const [teologiaProgress, pseProgress, continueLesson] = await Promise.all([
    getCourseProgress(user.id, ACADEMY_COURSE.id),
    getCourseProgress(user.id, PSE_COURSE.id),
    getContinueLesson(user.id),
  ]);

  const teologiaCompletedCount = teologiaProgress.filter((p) => p.completedAt).length;
  const pseCompletedCount = pseProgress.filter((p) => p.completedAt).length;

  const continueCardData = resolveContinueCard(continueLesson);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/" />
      <header className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-primary">
          <GraduationCapIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Academia do Pregador
          </h1>
        </span>
        <p className="text-muted">
          Formação para quem deseja crescer no estudo, na pregação e no ministério.
        </p>
      </header>

      {continueCardData && (
        <ContinueCard
          href={continueCardData.href}
          moduleTitle={continueCardData.moduleTitle}
          lessonInModule={continueCardData.lessonInModule}
          lessonTitle={continueCardData.lessonTitle}
        />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Cursos</h2>

        <Link
          href={`/academia/${ACADEMY_COURSE.id}`}
          className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
        >
          <div>
            <h3 className="text-lg font-bold text-foreground">{ACADEMY_COURSE.title}</h3>
            <p className="text-sm text-muted">{ACADEMY_COURSE.channel}</p>
          </div>
          <p className="text-sm text-muted">
            {ACADEMY_COURSE.totalLessons} aulas • {ACADEMY_COURSE.totalModules} módulos •{" "}
            {ACADEMY_COURSE.durationLabel}
          </p>
          {teologiaCompletedCount > 0 && (
            <p className="text-xs text-accent">
              {teologiaCompletedCount} de {ACADEMY_COURSE.totalLessons} aulas concluídas
            </p>
          )}
          <span className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ver curso
          </span>
        </Link>

        <Link
          href="/academia/pregacao-sem-enrolacao"
          className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
        >
          <div>
            <h3 className="text-lg font-bold text-foreground">{PSE_COURSE.title}</h3>
            <p className="text-sm text-muted">{PSE_COURSE.description}</p>
          </div>
          <p className="text-sm text-muted">{PSE_COURSE.totalLessons} aulas</p>
          {pseCompletedCount > 0 && (
            <p className="text-xs text-accent">
              {pseCompletedCount} de {PSE_COURSE.totalLessons} aulas concluídas
            </p>
          )}
          <span className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ver curso
          </span>
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Materiais em PDF</h2>

        <div className="flex flex-col gap-3">
          {SUPPORT_MATERIALS.map((material) => (
            <ExternalLinkCard
              key={material.title}
              title={material.title}
              url={material.url}
              cta="Abrir PDF"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
