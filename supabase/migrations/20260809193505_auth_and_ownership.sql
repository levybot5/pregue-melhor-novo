-- Etapa 4: autenticação mínima e isolamento real dos dados por usuário.

-- =====================================================================
-- 0. LIMPEZA DOS DADOS DE TESTE (aprovado pelo usuário)
-- =====================================================================
-- Só existiam registros de desenvolvimento até aqui. Como user_id vai
-- se tornar obrigatório e não faz sentido inventar um dono para eles,
-- apagamos antes de alterar a estrutura da tabela.
delete from public.contents;

-- =====================================================================
-- 1. PROFILES
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "select_own_profile" on public.profiles;
create policy "select_own_profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "update_own_profile" on public.profiles;
create policy "update_own_profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Sem policy de INSERT/DELETE para usuários: a linha de profile é criada
-- automaticamente pelo trigger abaixo quando a conta é criada em
-- auth.users, nunca diretamente pelo cliente.

-- Cria o profile automaticamente quando um novo usuário se cadastra.
-- SECURITY DEFINER: roda com privilégios do dono da função (ignora RLS),
-- necessário porque no momento do cadastro pode não haver sessão ativa
-- ainda (ex.: confirmação de e-mail pendente).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 2. CONTENTS: dono obrigatório
-- =====================================================================
alter table public.contents
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- A tabela está vazia neste ponto (passo 0), então é seguro tornar a
-- coluna obrigatória sem precisar popular linhas existentes.
alter table public.contents
  alter column user_id set not null;

-- =====================================================================
-- 3. RLS: remove a policy permissiva de desenvolvimento (Etapa 2) e
--    exige isolamento por dono, sem acesso público.
-- =====================================================================
drop policy if exists "dev_anon_all_contents" on public.contents;

drop policy if exists "select_own_contents" on public.contents;
create policy "select_own_contents"
  on public.contents
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert_own_contents" on public.contents;
create policy "insert_own_contents"
  on public.contents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update_own_contents" on public.contents;
create policy "update_own_contents"
  on public.contents
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_contents" on public.contents;
create policy "delete_own_contents"
  on public.contents
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Nenhuma policy para a role "anon": sem sessão, sem acesso — nem
-- leitura, nem escrita. RLS continua habilitado (herdado da Etapa 2).
