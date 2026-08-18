-- Trial sem login: 3 gerações grátis por dispositivo (device_id em
-- cookie HttpOnly, nunca em localStorage). Espelha exatamente o
-- padrão de generation_locks (Etapa 6): RLS ligado SEM policies —
-- a tabela é inacessível diretamente, só via funções SECURITY DEFINER
-- abaixo, que recebem device_id como parâmetro (não existe auth.uid()
-- pra visitante anônimo).

-- =====================================================================
-- TRIAL_USAGE_EVENTS
-- =====================================================================
create table if not exists public.trial_usage_events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  tool text not null,
  created_at timestamptz not null default now()
);

create index if not exists trial_usage_events_device_idx
  on public.trial_usage_events (device_id);

alter table public.trial_usage_events enable row level security;
-- Sem nenhuma policy: nem anon nem authenticated leem/escrevem direto
-- nesta tabela. Único acesso é via record_trial_usage/get_trial_usage_count.

-- =====================================================================
-- TRIAL_LOCKS
-- =====================================================================
-- Uma linha por device_id, nunca cresce — mesmo papel de
-- generation_locks, mas chaveado por dispositivo em vez de usuário.
create table if not exists public.trial_locks (
  device_id uuid primary key,
  started_at timestamptz not null default now(),
  in_progress boolean not null default false
);

alter table public.trial_locks enable row level security;
-- Sem policy: só acessível via try_reserve_trial_generation/release_trial_lock.

-- Tenta reservar 1 uso do trial para p_device_id. Retorna:
--   'ok'             -> pode prosseguir (lock reservado, chame release depois)
--   'limit_reached'  -> já consumiu p_limit gerações do trial
--   'in_progress'    -> já existe uma geração rodando agora para este device
--   'rate_limited'   -> uma geração começou há pouco (< p_min_interval_seconds)
--   'invalid_device' -> device_id nulo
--
-- Atômico: o SELECT ... FOR UPDATE serializa chamadas concorrentes do
-- MESMO device_id (a segunda só lê a linha depois que a primeira
-- transação — que já terá dado UPDATE/INSERT — commitar), então duas
-- requisições simultâneas nunca conseguem ambas passar da contagem de
-- 3. Toda a função roda em uma única transação implícita.
create or replace function public.try_reserve_trial_generation(
  p_device_id uuid,
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
  v_row public.trial_locks;
  v_used int;
begin
  if p_device_id is null then
    return 'invalid_device';
  end if;

  select * into v_row from public.trial_locks where device_id = p_device_id for update;

  if found then
    if v_row.in_progress and v_row.started_at > now() - make_interval(secs => p_stale_seconds) then
      return 'in_progress';
    end if;

    if v_row.started_at > now() - make_interval(secs => p_min_interval_seconds) then
      return 'rate_limited';
    end if;
  end if;

  select count(*) into v_used from public.trial_usage_events where device_id = p_device_id;
  if v_used >= p_limit then
    return 'limit_reached';
  end if;

  if found then
    update public.trial_locks
      set started_at = now(), in_progress = true
      where device_id = p_device_id;
  else
    begin
      insert into public.trial_locks (device_id, started_at, in_progress)
      values (p_device_id, now(), true);
    exception when unique_violation then
      -- Corrida rara: outra requisição criou a linha entre o SELECT e
      -- este INSERT (só pode acontecer na primeiríssima geração deste
      -- device_id, quando a linha ainda não existia para travar).
      return 'in_progress';
    end;
  end if;

  return 'ok';
end;
$$;

-- Libera o lock (sempre chamada depois da tentativa, sucesso ou
-- falha) — started_at fica intacto, o rate limit continua valendo.
create or replace function public.release_trial_lock(p_device_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.trial_locks
    set in_progress = false
    where device_id = p_device_id;
end;
$$;

-- Só deve ser chamada depois que a IA retornar uma resposta válida —
-- nunca antes, nunca em caso de erro/timeout (mesma regra de
-- recordUsage() para assinantes).
create or replace function public.record_trial_usage(p_device_id uuid, p_tool text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.trial_usage_events (device_id, tool) values (p_device_id, p_tool);
end;
$$;

-- Usado só para EXIBIÇÃO do contador ("N testes disponíveis"). A
-- decisão real de permitir ou não gerar é sempre try_reserve_trial_generation.
create or replace function public.get_trial_usage_count(p_device_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.trial_usage_events where device_id = p_device_id;
$$;

-- "anon" porque quem chama essas funções é sempre um visitante sem
-- sessão Supabase (client criado com a anon key, sem cookie de auth).
-- "authenticated" cobre o caso de usuário logado sem Pro ainda
-- consumindo trial pelo device_id (ver services/billing/guard.ts).
grant execute on function public.try_reserve_trial_generation(uuid, int, int, int) to anon, authenticated;
grant execute on function public.release_trial_lock(uuid) to anon, authenticated;
grant execute on function public.record_trial_usage(uuid, text) to anon, authenticated;
grant execute on function public.get_trial_usage_count(uuid) to anon, authenticated;
