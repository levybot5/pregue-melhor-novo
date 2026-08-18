import "server-only";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type LessonProgress = {
  courseId: string;
  moduleId: number;
  lessonId: number;
  completedAt: string | null;
  lastWatchedAt: string;
};

// Todo o progresso do usuário num curso — usado para calcular
// progresso por módulo e progresso geral nas telas de curso/módulo.
export async function getCourseProgress(
  userId: string,
  courseId: string,
): Promise<LessonProgress[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("course_progress")
    .select("course_id, module_id, lesson_id, completed_at, last_watched_at")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    courseId: row.course_id as string,
    moduleId: row.module_id as number,
    lessonId: row.lesson_id as number,
    completedAt: row.completed_at as string | null,
    lastWatchedAt: row.last_watched_at as string,
  }));
}

// Aula mais recentemente aberta pelo usuário, em QUALQUER curso da
// Academia — alimenta o único card "Continuar estudando" da tela
// principal (não é por curso).
export async function getContinueLesson(
  userId: string,
): Promise<{ courseId: string; moduleId: number; lessonId: number } | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("course_progress")
    .select("course_id, module_id, lesson_id")
    .eq("user_id", userId)
    .order("last_watched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    courseId: data.course_id as string,
    moduleId: data.module_id as number,
    lessonId: data.lesson_id as number,
  };
}

// Chamado ao abrir a página da aula: só registra "assistindo agora"
// (last_watched_at) para o "Continuar estudando" — nunca marca como
// concluída sozinho (ver §9: conclusão é sempre um clique explícito).
// Upsert sem incluir completed_at, então uma aula já concluída
// continua concluída ao ser reaberta.
export async function recordLessonWatched(
  userId: string,
  courseId: string,
  moduleId: number,
  lessonId: number,
): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("course_progress").upsert(
    {
      user_id: userId,
      course_id: courseId,
      module_id: moduleId,
      lesson_id: lessonId,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id,lesson_id" },
  );

  if (error) throw error;
}

// Marca ou desmarca a aula como concluída — só chamado pelo clique
// explícito do usuário no botão "Marcar como concluída" / "Aula
// concluída" (nunca automaticamente).
export async function setLessonCompletion(
  userId: string,
  courseId: string,
  moduleId: number,
  lessonId: number,
  completed: boolean,
): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("course_progress").upsert(
    {
      user_id: userId,
      course_id: courseId,
      module_id: moduleId,
      lesson_id: lessonId,
      completed_at: completed ? new Date().toISOString() : null,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id,lesson_id" },
  );

  if (error) throw error;

  // Progresso aparece em várias telas (Academia, curso, módulo, Home)
  // — revalida para não deixar número desatualizado em cache, igual ao
  // padrão já usado em services/billing/usage.ts.
  revalidatePath("/academia", "layout");
}
