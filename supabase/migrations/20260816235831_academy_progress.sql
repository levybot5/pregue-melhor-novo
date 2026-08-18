-- Academia do Pregador: progresso de aulas do "Curso Básico de Teologia"
-- (RTM Brasil). O conteúdo do curso (módulos/aulas/vídeos) NÃO mora no
-- banco — é dado estático versionado em src/lib/academy/course-data.ts,
-- por isso course_id/module_id/lesson_id aqui são só os identificadores
-- usados naquele arquivo (texto/inteiro), sem FK — não existe tabela de
-- conteúdo para referenciar.

create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  module_id int not null,
  lesson_id int not null,
  completed_at timestamptz,
  last_watched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Uma linha por (usuário, aula): evita duplicação e permite UPSERT tanto
-- ao só assistir (last_watched_at) quanto ao marcar/desmarcar concluída
-- (completed_at) sem criar registros repetidos.
create unique index if not exists course_progress_user_lesson_idx
  on public.course_progress (user_id, lesson_id);

-- Acelera "quantas aulas concluídas neste módulo" e "progresso geral do
-- curso", os dois cálculos mais frequentes das telas da Academia.
create index if not exists course_progress_user_course_module_idx
  on public.course_progress (user_id, course_id, module_id);

-- "Continuar estudando" busca a aula com last_watched_at mais recente.
create index if not exists course_progress_user_last_watched_idx
  on public.course_progress (user_id, last_watched_at desc);

alter table public.course_progress enable row level security;

-- Progresso é pessoal: cada usuário só lê/escreve suas próprias linhas.
-- Sem policy para outros papéis — isolamento total entre usuários.
drop policy if exists "select_own_course_progress" on public.course_progress;
create policy "select_own_course_progress"
  on public.course_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert_own_course_progress" on public.course_progress;
create policy "insert_own_course_progress"
  on public.course_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update_own_course_progress" on public.course_progress;
create policy "update_own_course_progress"
  on public.course_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_course_progress" on public.course_progress;
create policy "delete_own_course_progress"
  on public.course_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);
