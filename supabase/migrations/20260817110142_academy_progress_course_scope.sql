-- A Academia ganhou um segundo curso ("Pregação Sem Enrolação"). Como
-- cada curso numera suas próprias aulas a partir de 1, o índice único
-- antigo (user_id, lesson_id) colidiria entre cursos diferentes (ex.:
-- aula 5 do Curso Básico de Teologia e aula 5 de Pregação Sem
-- Enrolação são linhas diferentes, mas tinham a mesma chave). Escopa
-- por curso também.

drop index if exists public.course_progress_user_lesson_idx;

create unique index if not exists course_progress_user_course_lesson_idx
  on public.course_progress (user_id, course_id, lesson_id);
