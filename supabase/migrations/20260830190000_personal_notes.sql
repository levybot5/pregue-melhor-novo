-- Bloco de Anotações: bloco de notas pessoal e livre (ideias de
-- pregação, versículos, temas, insights, lembretes) — sem IA, sem
-- vínculo com passagem bíblica específica (isso já existe em
-- bible_notes, ver 20260829120000_bible_reader.sql). Uma linha por
-- anotação, título + conteúdo livres.
create table if not exists public.personal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lista sempre ordenada da mais recente pra mais antiga.
create index if not exists personal_notes_user_updated_idx
  on public.personal_notes (user_id, updated_at desc);

-- Reaproveita a função já criada em 20260809152839_create_contents.sql
-- (mesmo padrão de bible_notes) — não redefinir aqui.
drop trigger if exists set_personal_notes_updated_at on public.personal_notes;
create trigger set_personal_notes_updated_at
  before update on public.personal_notes
  for each row
  execute function public.set_updated_at();

alter table public.personal_notes enable row level security;

drop policy if exists "select_own_personal_notes" on public.personal_notes;
create policy "select_own_personal_notes"
  on public.personal_notes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert_own_personal_notes" on public.personal_notes;
create policy "insert_own_personal_notes"
  on public.personal_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update_own_personal_notes" on public.personal_notes;
create policy "update_own_personal_notes"
  on public.personal_notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_personal_notes" on public.personal_notes;
create policy "delete_own_personal_notes"
  on public.personal_notes
  for delete
  to authenticated
  using (auth.uid() = user_id);
