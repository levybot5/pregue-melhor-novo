-- Bíblia Guiada: leitor de livro/capítulo com texto integral,
-- explicação de versículo por IA (cacheada), grifos, anotações e
-- progresso de leitura. Estrutura dos livros (nome/quantidade de
-- capítulos) é dado estático em src/lib/bible/books-data.ts — aqui só
-- entra o texto em si e os dados por usuário.

-- =====================================================================
-- 1. TEXTO BÍBLICO
-- =====================================================================
-- Conteúdo do sistema, não do usuário: carregado uma única vez pelo
-- script scripts/import-bible.mjs (via client de service role, nunca
-- pelo client normal) a partir da tradução ACF (Almeida Corrigida
-- Fiel, de distribuição livre), lida de um único arquivo JSON estático
-- (repositório público thiagobodruk/biblia). Só leitura para o client.
create table if not exists public.bible_verses (
  id uuid primary key default gen_random_uuid(),
  book text not null,
  chapter int not null,
  verse int not null,
  text text not null,
  version text not null default 'arc',
  created_at timestamptz not null default now()
);

create unique index if not exists bible_verses_ref_idx
  on public.bible_verses (book, chapter, verse, version);

-- Acelera "todos os versículos deste capítulo, em ordem".
create index if not exists bible_verses_chapter_idx
  on public.bible_verses (book, chapter, version);

alter table public.bible_verses enable row level security;

drop policy if exists "select_bible_verses" on public.bible_verses;
create policy "select_bible_verses"
  on public.bible_verses
  for select
  to authenticated
  using (true);

-- =====================================================================
-- 2. PROGRESSO DE LEITURA
-- =====================================================================
-- Mesmo padrão de course_progress: uma linha por (usuário, capítulo),
-- last_read_at é a base do "continuar de onde parou".
create table if not exists public.bible_reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book text not null,
  chapter int not null,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists bible_reading_progress_user_ref_idx
  on public.bible_reading_progress (user_id, book, chapter);

create index if not exists bible_reading_progress_user_last_read_idx
  on public.bible_reading_progress (user_id, last_read_at desc);

alter table public.bible_reading_progress enable row level security;

drop policy if exists "select_own_bible_reading_progress" on public.bible_reading_progress;
create policy "select_own_bible_reading_progress"
  on public.bible_reading_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert_own_bible_reading_progress" on public.bible_reading_progress;
create policy "insert_own_bible_reading_progress"
  on public.bible_reading_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update_own_bible_reading_progress" on public.bible_reading_progress;
create policy "update_own_bible_reading_progress"
  on public.bible_reading_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_bible_reading_progress" on public.bible_reading_progress;
create policy "delete_own_bible_reading_progress"
  on public.bible_reading_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- 3. GRIFOS
-- =====================================================================
-- verse_id no formato "livro.capitulo.versiculo" (ex.: "joao.3.16") —
-- sem FK pra bible_verses de propósito, mesmo raciocínio de favorites
-- (identificador estável, não precisa join pra grifar/desgrifar).
-- Uma cor por versículo por usuário: grifar de novo troca a cor.
create table if not exists public.bible_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verse_id text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists bible_highlights_user_verse_idx
  on public.bible_highlights (user_id, verse_id);

alter table public.bible_highlights enable row level security;

drop policy if exists "select_own_bible_highlights" on public.bible_highlights;
create policy "select_own_bible_highlights"
  on public.bible_highlights
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert_own_bible_highlights" on public.bible_highlights;
create policy "insert_own_bible_highlights"
  on public.bible_highlights
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update_own_bible_highlights" on public.bible_highlights;
create policy "update_own_bible_highlights"
  on public.bible_highlights
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_bible_highlights" on public.bible_highlights;
create policy "delete_own_bible_highlights"
  on public.bible_highlights
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- 4. ANOTAÇÕES
-- =====================================================================
-- Uma anotação por versículo por usuário, editável no lugar (igual ao
-- name de profiles). Reaproveita a função set_updated_at() já criada
-- na migration de auth_and_ownership.
create table if not exists public.bible_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verse_id text not null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bible_notes_user_verse_idx
  on public.bible_notes (user_id, verse_id);

drop trigger if exists set_bible_notes_updated_at on public.bible_notes;
create trigger set_bible_notes_updated_at
  before update on public.bible_notes
  for each row
  execute function public.set_updated_at();

alter table public.bible_notes enable row level security;

drop policy if exists "select_own_bible_notes" on public.bible_notes;
create policy "select_own_bible_notes"
  on public.bible_notes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert_own_bible_notes" on public.bible_notes;
create policy "insert_own_bible_notes"
  on public.bible_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update_own_bible_notes" on public.bible_notes;
create policy "update_own_bible_notes"
  on public.bible_notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_bible_notes" on public.bible_notes;
create policy "delete_own_bible_notes"
  on public.bible_notes
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- 5. CACHE DE EXPLICAÇÃO DE VERSÍCULO (IA)
-- =====================================================================
-- Não é por usuário: a explicação de um versículo é a mesma pra todo
-- mundo, então cachear evita chamar a IA de novo pra um versículo já
-- explicado (ex.: João 3:16) — cache hit não gasta cota de geração de
-- ninguém. Qualquer usuário autenticado pode gravar (é quem gera o
-- cache miss), por isso o insert não exige dono.
create table if not exists public.bible_verse_explanations (
  id uuid primary key default gen_random_uuid(),
  verse_id text not null,
  version text not null default 'arc',
  explanation jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists bible_verse_explanations_ref_idx
  on public.bible_verse_explanations (verse_id, version);

alter table public.bible_verse_explanations enable row level security;

drop policy if exists "select_bible_verse_explanations" on public.bible_verse_explanations;
create policy "select_bible_verse_explanations"
  on public.bible_verse_explanations
  for select
  to authenticated
  using (true);

drop policy if exists "insert_bible_verse_explanations" on public.bible_verse_explanations;
create policy "insert_bible_verse_explanations"
  on public.bible_verse_explanations
  for insert
  to authenticated
  with check (true);
