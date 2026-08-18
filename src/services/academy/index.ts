// Camada de acesso ao progresso da Academia do Pregador no Supabase.
// O conteúdo do curso (módulos/aulas) não é deste serviço — vem de
// src/lib/academy/course-data.ts (estático, sem I/O).

export {
  getCourseProgress,
  getContinueLesson,
  recordLessonWatched,
  setLessonCompletion,
} from "./progress";
export type { LessonProgress } from "./progress";
