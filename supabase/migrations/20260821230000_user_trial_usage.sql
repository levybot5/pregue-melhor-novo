-- Trial keyed to auth.uid() (etapa: cadastro obrigatório antes de
-- qualquer acesso ao app — ninguém mais usa as ferramentas sem
-- conta). Espelha generation_locks/try_acquire_generation_lock
-- (migration 20260810120134): RLS ligado SEM NENHUMA policy, só
-- acessível via funções SECURITY DEFINER que leem auth.uid() por
-- dentro — nunca um parâmetro vindo do chamador, diferente do
-- sistema antigo por device_id (que aceitava device_id como
-- parâmetro porque visitante anônimo não tem auth.uid()).
--
-- NÃO mexe em trial_usage_events/trial_locks (migration
-- 20260817120000, por device_id) — ficam inertes, histórico morto,
-- sem apagar nada.

create table if not exists public.user_trial_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_trial_usage_events_user_created_idx
  on public.user_trial_usage_events (user_id, created_at);

alter table public.user_trial_usage_events enable row level security;
-- Sem nenhuma policy: só acessível via as funções abaixo.

create table if not exists public.user_trial_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  in_progress boolean not null default false
);

alter table public.user_trial_locks enable row level security;
-- Sem policy: só acessível via try_reserve_user_trial_generation/release_user_trial_lock.

-- Tenta reservar 1 uso do trial para o usuário autenticado. Retorna:
--   'ok'              -> pode prosseguir (lock reservado, chame release depois)
--   'limit_reached'   -> já consumiu p_limit gerações do trial
--   'in_progress'     -> já existe uma geração rodando agora
--   'rate_limited'    -> uma geração começou há pouco (< p_min_interval_seconds)
--   'unauthenticated' -> sem sessão
create or replace function public.try_reserve_user_trial_generation(
  p_limit int default 3,
  p_min_interval_seconds int default 5,
  p_stale_seconds int default 60
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.user_trial_locks;
  v_count int;
begin
  if v_user_id is null then
    return 'unauthenticated';
  end if;

  select * into v_row from public.user_trial_locks where user_id = v_user_id for update;

  if found then
    if v_row.in_progress and v_row.started_at > now() - make_interval(secs => p_stale_seconds) then
      return 'in_progress';
    end if;

    if v_row.started_at > now() - make_interval(secs => p_min_interval_seconds) then
      return 'rate_limited';
    end if;
  end if;

  select count(*) into v_count from public.user_trial_usage_events where user_id = v_user_id;
  if v_count >= p_limit then
    return 'limit_reached';
  end if;

  if found then
    update public.user_trial_locks
      set started_at = now(), in_progress = true
      where user_id = v_user_id;
  else
    begin
      insert into public.user_trial_locks (user_id, started_at, in_progress)
      values (v_user_id, now(), true);
    exception when unique_violation then
      -- Corrida rara: outra requisição criou a linha entre o SELECT e
      -- este INSERT (só na primeiríssima geração deste usuário).
      return 'in_progress';
    end;
  end if;

  return 'ok';
end;
$$;

-- Libera o lock (sempre chamada depois da tentativa, sucesso ou
-- falha) — started_at fica intacto, o rate limit continua valendo.
create or replace function public.release_user_trial_lock()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_trial_locks
    set in_progress = false
    where user_id = auth.uid();
end;
$$;

-- Só deve ser chamada depois que a IA retornar uma resposta válida —
-- nunca antes, nunca em caso de erro/timeout (mesma regra de
-- record_trial_usage/recordUsage).
create or replace function public.record_user_trial_usage(p_tool text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'unauthenticated';
  end if;
  insert into public.user_trial_usage_events (user_id, tool) values (auth.uid(), p_tool);
end;
$$;

-- Usado só para EXIBIÇÃO do contador ("N testes disponíveis"). A
-- decisão real de permitir ou não gerar é sempre
-- try_reserve_user_trial_generation.
create or replace function public.get_user_trial_usage_count()
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.user_trial_usage_events where user_id = auth.uid();
$$;

-- Só "authenticated": diferente do trial por device (que aceitava
-- "anon" porque visitante sem sessão participava do trial), agora
-- ninguém sem sessão chega perto dessas funções.
grant execute on function public.try_reserve_user_trial_generation(int, int, int) to authenticated;
grant execute on function public.release_user_trial_lock() to authenticated;
grant execute on function public.record_user_trial_usage(text) to authenticated;
grant execute on function public.get_user_trial_usage_count() to authenticated;
