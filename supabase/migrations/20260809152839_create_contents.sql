-- Etapa 2: tabela mínima de conteúdos, para validar a persistência real
-- via Supabase. Ainda NÃO há usuários/autenticação — ver aviso de RLS
-- no final deste arquivo antes de rodar em produção.

create extension if not exists pgcrypto;

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  base_text text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mantém updated_at correto a cada UPDATE.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_contents_updated_at on public.contents;
create trigger set_contents_updated_at
  before update on public.contents
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- AVISO DE SEGURANÇA (leia antes de usar em produção)
-- =====================================================================
-- Habilitamos Row Level Security, mas como ainda não existe login,
-- a política abaixo libera SELECT/INSERT/UPDATE/DELETE para a role
-- "anon" (ou seja, para qualquer pessoa que tenha a anon key, que é
-- pública por natureza). Isso significa que, nesta etapa, QUALQUER
-- visitante pode ler, criar, editar e apagar QUALQUER linha desta
-- tabela. Não há isolamento por usuário.
--
-- Isso é aceitável apenas enquanto estamos validando a arquitetura de
-- persistência em desenvolvimento, com dados de teste. Antes de haver
-- usuários reais, esta política precisa ser substituída por uma que
-- vincule cada linha a um usuário (coluna user_id + policy usando
-- auth.uid()), quando o login for implementado.
alter table public.contents enable row level security;

drop policy if exists "dev_anon_all_contents" on public.contents;
create policy "dev_anon_all_contents"
  on public.contents
  for all
  to anon
  using (true)
  with check (true);
