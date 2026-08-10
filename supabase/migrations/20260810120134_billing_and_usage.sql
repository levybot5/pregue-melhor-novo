-- Etapa 6: planos, controle de uso e proteção contra abuso.
-- Ainda NÃO existe gateway de pagamento — ativação de plano é manual.
-- Ver o relatório desta etapa para o SQL de ativação usado em dev.

-- =====================================================================
-- SUBSCRIPTIONS
-- =====================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'pro',
  status text not null default 'inactive'
    check (status in ('active', 'inactive', 'past_due', 'cancelled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reaproveita a função set_updated_at() já criada na Etapa 2 (migration
-- de contents) — não recriamos ela aqui.
drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- Usuário só pode LER a própria assinatura. Nenhuma policy de
-- insert/update/delete: mudanças de plano/status são administrativas
-- (SQL manual nesta etapa; futuramente, webhook do gateway rodando com
-- privilégio elevado, nunca a partir do navegador do usuário).
drop policy if exists "select_own_subscription" on public.subscriptions;
create policy "select_own_subscription"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- USAGE_EVENTS
-- =====================================================================
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null,
  created_at timestamptz not null default now()
);

-- Índice composto: toda contagem diária/mensal filtra por user_id e
-- created_at, então isso mantém a contagem rápida mesmo com o tempo.
create index if not exists usage_events_user_created_idx
  on public.usage_events (user_id, created_at);

alter table public.usage_events enable row level security;

drop policy if exists "select_own_usage" on public.usage_events;
create policy "select_own_usage"
  on public.usage_events
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Usuário pode registrar o próprio consumo (é isso que o app faz logo
-- após uma geração válida), mas não pode alterar nem apagar depois —
-- sem policy de update/delete.
drop policy if exists "insert_own_usage" on public.usage_events;
create policy "insert_own_usage"
  on public.usage_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =====================================================================
-- GENERATION_LOCKS
-- =====================================================================
-- Proteção contra duas gerações simultâneas do mesmo usuário + rate
-- limit (mínimo de segundos entre inícios de geração). Uma linha por
-- usuário, sempre a mesma — nunca cresce.
--
-- RLS habilitado SEM NENHUMA policy para "authenticated": a tabela é
-- inacessível diretamente. O único jeito de mexer nela é pelas duas
-- funções abaixo, que usam auth.uid() internamente — o chamador nunca
-- escolhe de quem é o lock, então não dá para "travar" outro usuário.
create table if not exists public.generation_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  in_progress boolean not null default false
);

alter table public.generation_locks enable row level security;

-- Tenta reservar o direito de gerar. Retorna:
--   'ok'            -> pode prosseguir (lock reservado, chame release depois)
--   'in_progress'   -> já existe uma geração rodando agora
--   'rate_limited'  -> uma geração começou há pouco (menos de p_min_interval_seconds)
--   'unauthenticated' -> sem sessão
create or replace function public.try_acquire_generation_lock(
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
  v_row public.generation_locks;
begin
  if v_user_id is null then
    return 'unauthenticated';
  end if;

  -- SELECT ... FOR UPDATE serializa chamadas concorrentes do mesmo
  -- usuário: a segunda chamada só lê a linha depois que a primeira
  -- transação (que já terá dado UPDATE/INSERT) commitar.
  select * into v_row from public.generation_locks where user_id = v_user_id for update;

  if found then
    if v_row.in_progress and v_row.started_at > now() - make_interval(secs => p_stale_seconds) then
      return 'in_progress';
    end if;

    if v_row.started_at > now() - make_interval(secs => p_min_interval_seconds) then
      return 'rate_limited';
    end if;

    update public.generation_locks
      set started_at = now(), in_progress = true
      where user_id = v_user_id;
  else
    begin
      insert into public.generation_locks (user_id, started_at, in_progress)
      values (v_user_id, now(), true);
    exception when unique_violation then
      -- Corrida rara: outra requisição criou a linha entre o SELECT e
      -- este INSERT (só pode acontecer na primeiríssima geração do
      -- usuário, quando a linha ainda não existia para travar).
      return 'in_progress';
    end;
  end if;

  return 'ok';
end;
$$;

-- Libera o lock (sempre chamada depois da tentativa de geração,
-- sucesso ou falha) — mas mantém started_at intacto, porque o rate
-- limit deve continuar valendo mesmo depois que a geração terminou.
create or replace function public.release_generation_lock()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.generation_locks
    set in_progress = false
    where user_id = auth.uid();
end;
$$;

grant execute on function public.try_acquire_generation_lock(int, int) to authenticated;
grant execute on function public.release_generation_lock() to authenticated;
