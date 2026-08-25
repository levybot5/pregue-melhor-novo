-- Painel admin somente-leitura em /admin. Duas peças de autorização:
--
-- 1) admin_users: NÃO é uma coluna is_admin em profiles — profiles tem
--    a policy update_own_profile (auth.uid() = id), então qualquer
--    usuário autenticado poderia flipar a própria coluna se ela
--    existisse ali. Tabela separada, RLS ligado, ZERO policies (mesmo
--    padrão de generation_locks/trial_locks): inacessível diretamente,
--    só legível via is_current_user_admin() abaixo, e só escrita por
--    SQL manual do dono do produto — não existe fluxo de "virar admin"
--    no app.
--
-- 2) is_current_user_admin(): único jeito de checar admin. Toda função
--    admin_get_*/admin_list_* abaixo RE-CHECA isso por dentro,
--    independente da página que a chamou — defesa em profundidade,
--    nunca confia só no gate de src/app/admin/layout.tsx.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Sem nenhuma policy — ver comentário acima.

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_current_user_admin() to authenticated;

-- =====================================================================
-- admin_get_overview_stats()
-- =====================================================================
-- Cards do topo do dashboard. "active_subscribers" usa o MESMO
-- predicado de isSubscriptionActive (status='active' E período não
-- vencido) — nunca conta status='active' sozinho, senão superestima
-- (um Pix vencido continua com status='active' até o próximo pagamento
-- ou até um evento explícito, por desenho — "deixa a data vencer
-- sozinha"). MRR usa R$10 fixo por assinante ativo (normalizado, Pix e
-- cartão pelo mesmo valor de face) — precisa ficar em sincronia manual
-- com PRO_PRICE (purchase.ts) e PRO_VALUE (checkouts.ts) caso o preço
-- mude; não há coluna de valor em subscriptions hoje.
create or replace function public.admin_get_overview_stats()
returns table (
  active_subscribers int,
  new_this_month int,
  cancelled_this_month int,
  past_due_count int,
  expired_unrenewed_count int,
  mrr numeric,
  revenue_this_month numeric,
  pix_active_count int,
  card_active_count int
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    (select count(*) from public.subscriptions
       where status = 'active' and (current_period_end is null or current_period_end > now()))::int,
    (select count(*) from public.subscriptions
       where created_at >= date_trunc('month', now())
         and created_at < date_trunc('month', now()) + interval '1 month')::int,
    -- Sem dados antes do deploy de subscription_events (tabela vazia) — honesto por natureza (0).
    (select count(*) from public.subscription_events
       where event_type = 'cancelled'
         and occurred_at >= date_trunc('month', now())
         and occurred_at < date_trunc('month', now()) + interval '1 month')::int,
    (select count(*) from public.subscriptions where status = 'past_due')::int,
    (select count(*) from public.subscriptions
       where status = 'active' and payment_method = 'pix'
         and current_period_end is not null and current_period_end <= now())::int,
    (select coalesce(count(*), 0) * 10 from public.subscriptions
       where status = 'active' and (current_period_end is null or current_period_end > now()))::numeric,
    (select coalesce(sum(amount), 0) from public.pending_purchases
       where status = 'paid'
         and paid_at >= date_trunc('month', now())
         and paid_at < date_trunc('month', now()) + interval '1 month')::numeric,
    (select count(*) from public.subscriptions
       where status = 'active' and payment_method = 'pix'
         and (current_period_end is null or current_period_end > now()))::int,
    (select count(*) from public.subscriptions
       where status = 'active' and payment_method = 'credit_card'
         and (current_period_end is null or current_period_end > now()))::int;
end;
$$;

grant execute on function public.admin_get_overview_stats() to authenticated;

-- =====================================================================
-- admin_list_subscribers(...)
-- =====================================================================
-- Lista paginada com filtros. total_count via window function evita
-- uma segunda RPC só de contagem. Email vem de auth.users, lido direto
-- de dentro da função SECURITY DEFINER (dono postgres tem acesso ao
-- schema auth) — evita N chamadas à Admin API por página.
create or replace function public.admin_list_subscribers(
  p_status text default null,
  p_payment_method text default null,
  p_entry_from timestamptz default null,
  p_entry_to timestamptz default null,
  p_search text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  user_id uuid,
  email text,
  status text,
  payment_method text,
  entry_date timestamptz,
  current_period_end timestamptz,
  last_payment_at timestamptz,
  days_as_subscriber int,
  generation_count_current_period bigint,
  total_count bigint
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    s.user_id,
    u.email::text,
    s.status,
    s.payment_method,
    s.created_at as entry_date,
    s.current_period_end,
    (select max(pp.paid_at) from public.pending_purchases pp
       where pp.claimed_by_user_id = s.user_id and pp.status = 'paid') as last_payment_at,
    extract(day from now() - s.created_at)::int as days_as_subscriber,
    (select count(*) from public.usage_events ue
       where ue.user_id = s.user_id
         and ue.created_at >= coalesce(s.current_period_start, s.created_at)) as generation_count_current_period,
    count(*) over() as total_count
  from public.subscriptions s
  join auth.users u on u.id = s.user_id
  where (p_status is null or s.status = p_status)
    and (p_payment_method is null or s.payment_method = p_payment_method)
    and (p_entry_from is null or s.created_at >= p_entry_from)
    and (p_entry_to is null or s.created_at <= p_entry_to)
    and (p_search is null or u.email ilike '%' || p_search || '%')
  order by s.created_at desc
  limit p_limit offset p_offset;
end;
$$;

grant execute on function public.admin_list_subscribers(text, text, timestamptz, timestamptz, text, int, int) to authenticated;

-- =====================================================================
-- admin_get_subscriber_detail(p_user_id)
-- =====================================================================
-- jsonb de propósito: a tela de detalhe precisa de várias peças
-- (assinatura + histórico de pagamento + uso + conteúdo salvo +
-- progresso da Academia) numa única viagem ao banco.
-- provider_subscription_id vem MASCARADO (só os 4 primeiros
-- caracteres) — nunca o id completo do provedor exposto numa tela.
create or replace function public.admin_get_subscriber_detail(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'user_id', s.user_id,
    'email', u.email,
    'status', s.status,
    'payment_method', s.payment_method,
    'provider', s.provider,
    'provider_subscription_id_masked', case
      when s.provider_subscription_id is null then null
      else left(s.provider_subscription_id, 4) || repeat('*', greatest(length(s.provider_subscription_id) - 4, 0))
    end,
    'entry_date', s.created_at,
    'current_period_start', s.current_period_start,
    'current_period_end', s.current_period_end,
    'signup_date', u.created_at,
    'payment_history', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', pp.id, 'amount', pp.amount, 'status', pp.status,
        'payment_method', pp.payment_method, 'paid_at', pp.paid_at, 'created_at', pp.created_at
      ) order by pp.created_at desc), '[]'::jsonb)
      from public.pending_purchases pp
      where pp.claimed_by_user_id = p_user_id
    ),
    'generation_count', (select count(*) from public.usage_events where user_id = p_user_id),
    'last_generation_at', (select max(created_at) from public.usage_events where user_id = p_user_id),
    'saved_content_count', (select count(*) from public.contents where user_id = p_user_id),
    'course_progress_summary', (
      select jsonb_build_object(
        'lessons_completed', count(*) filter (where completed_at is not null),
        'lessons_started', count(*)
      )
      from public.course_progress where user_id = p_user_id
    )
  )
  into v_result
  from public.subscriptions s
  join auth.users u on u.id = s.user_id
  where s.user_id = p_user_id;

  return v_result; -- null se o user_id não tiver linha em subscriptions
end;
$$;

grant execute on function public.admin_get_subscriber_detail(uuid) to authenticated;

-- =====================================================================
-- admin_get_usage_stats()
-- =====================================================================
-- Agregação do lado do banco de propósito: usage_events só tem índice
-- (user_id, created_at), não eficiente para "GROUP BY dia entre todos
-- os usuários" — não dá pra puxar linhas cruas pro navegador aqui.
create or replace function public.admin_get_usage_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'generations_last_7_days', (select count(*) from public.usage_events where created_at >= now() - interval '7 days'),
    'generations_last_30_days', (select count(*) from public.usage_events where created_at >= now() - interval '30 days'),
    'active_users_last_7_days', (select count(distinct user_id) from public.usage_events where created_at >= now() - interval '7 days'),
    'active_users_last_30_days', (select count(distinct user_id) from public.usage_events where created_at >= now() - interval '30 days'),
    'avg_generations_per_subscriber_30_days', (
      select case when count(distinct s.user_id) = 0 then 0
        else round(count(ue.*)::numeric / count(distinct s.user_id), 2) end
      from public.subscriptions s
      left join public.usage_events ue
        on ue.user_id = s.user_id and ue.created_at >= now() - interval '30 days'
      where s.status = 'active' and (s.current_period_end is null or s.current_period_end > now())
    ),
    'distribution_30_days', (
      select jsonb_build_object(
        'zero', count(*) filter (where cnt = 0),
        'one_to_five', count(*) filter (where cnt between 1 and 5),
        'six_to_twenty', count(*) filter (where cnt between 6 and 20),
        'twentyone_to_fifty', count(*) filter (where cnt between 21 and 50),
        'fifty_plus', count(*) filter (where cnt > 50)
      )
      from (
        select s.user_id, count(ue.*) as cnt
        from public.subscriptions s
        left join public.usage_events ue
          on ue.user_id = s.user_id and ue.created_at >= now() - interval '30 days'
        where s.status = 'active' and (s.current_period_end is null or s.current_period_end > now())
        group by s.user_id
      ) counts
    )
  )
  into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_get_usage_stats() to authenticated;

-- =====================================================================
-- admin_get_cohort_retention()
-- =====================================================================
-- Coorte = mês do primeiro evento 'activated'. Como subscription_events
-- nasce vazio, todo assinante ATUAL (ativado antes deste deploy) não
-- tem evento 'activated' — logo não aparece em nenhuma coorte ainda.
-- Isso é intencional: melhor "sem dados suficientes" (array vazio) do
-- que inventar uma coorte a partir de subscriptions.created_at (que não
-- nos diz se o usuário ficou ativo continuamente). Cada retained_N_pct
-- só é calculado quando já passou tempo suficiente desde o mês da
-- coorte (senão vem null = "sem dados suficientes ainda").
create or replace function public.admin_get_cohort_retention()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  with cohort_entries as (
    select user_id, min(occurred_at) as entry_at
    from public.subscription_events
    where event_type = 'activated'
    group by user_id
  ),
  cohorts as (
    select date_trunc('month', entry_at) as cohort_month, user_id, entry_at
    from cohort_entries
  ),
  churn_events as (
    select user_id, min(occurred_at) as churned_at
    from public.subscription_events
    where event_type in ('cancelled', 'refunded')
    group by user_id
  )
  select coalesce(jsonb_agg(row_to_json(t) order by t.cohort_month), '[]'::jsonb)
  into v_result
  from (
    select
      to_char(c.cohort_month, 'YYYY-MM') as cohort_month,
      count(*) as cohort_size,
      case when now() >= c.cohort_month + interval '30 days' then
        round(100.0 * count(*) filter (
          where ch.churned_at is null or ch.churned_at > c.entry_at + interval '30 days'
        ) / count(*), 1)
      else null end as retained_30_pct,
      case when now() >= c.cohort_month + interval '60 days' then
        round(100.0 * count(*) filter (
          where ch.churned_at is null or ch.churned_at > c.entry_at + interval '60 days'
        ) / count(*), 1)
      else null end as retained_60_pct,
      case when now() >= c.cohort_month + interval '90 days' then
        round(100.0 * count(*) filter (
          where ch.churned_at is null or ch.churned_at > c.entry_at + interval '90 days'
        ) / count(*), 1)
      else null end as retained_90_pct
    from cohorts c
    left join churn_events ch on ch.user_id = c.user_id
    group by c.cohort_month
  ) t;

  return v_result; -- '[]' até que existam eventos 'activated' pós-deploy
end;
$$;

grant execute on function public.admin_get_cohort_retention() to authenticated;

-- =====================================================================
-- admin_get_churn_stats()
-- =====================================================================
-- Fórmulas exatamente como definidas pelo dono do produto:
--   churn = (clientes perdidos no período) / (clientes ativos no início do período)
--   retenção = (clientes do início do período que continuam ativos) / (clientes ativos no início do período)
-- "Perdidos" = cancelamento voluntário + past_due de cartão + estorno
-- (event-sourced, zerado antes do deploy) + não-renovação de Pix
-- (calculado AO VIVO a partir de subscriptions, porque vencimento
-- silencioso de Pix nunca gera evento — ver nota no jsonb de retorno).
create or replace function public.admin_get_churn_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_now timestamptz := now();
  v_30d_start timestamptz := now() - interval '30 days';
  v_month_start timestamptz := date_trunc('month', now());
  v_result jsonb;
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  with active_at as (
    select p.period_start, (
      select count(*) from public.subscriptions s
      where s.created_at < p.period_start
        and (
          s.status <> 'cancelled'
          or not exists (
            select 1 from public.subscription_events ev
            where ev.user_id = s.user_id
              and ev.event_type in ('cancelled', 'refunded')
              and ev.occurred_at < p.period_start
          )
        )
    ) as cnt
    from (values (v_30d_start), (v_month_start)) as p(period_start)
  ),
  lost_30d as (
    select
      count(*) filter (where event_type = 'cancelled') as voluntary_cancel,
      count(*) filter (where event_type = 'past_due') as card_past_due,
      count(*) filter (where event_type = 'refunded') as refunded
    from (
      select distinct on (user_id) user_id, event_type
      from public.subscription_events
      where occurred_at >= v_30d_start and event_type in ('cancelled', 'past_due', 'refunded')
      order by user_id, occurred_at desc
    ) x
  ),
  lost_month as (
    select
      count(*) filter (where event_type = 'cancelled') as voluntary_cancel,
      count(*) filter (where event_type = 'past_due') as card_past_due,
      count(*) filter (where event_type = 'refunded') as refunded
    from (
      select distinct on (user_id) user_id, event_type
      from public.subscription_events
      where occurred_at >= v_month_start and event_type in ('cancelled', 'past_due', 'refunded')
      order by user_id, occurred_at desc
    ) x
  ),
  pix_nr_30d as (
    select count(*) as cnt from public.subscriptions
    where payment_method = 'pix' and status = 'active'
      and current_period_end >= v_30d_start and current_period_end < v_now
  ),
  pix_nr_month as (
    select count(*) as cnt from public.subscriptions
    where payment_method = 'pix' and status = 'active'
      and current_period_end >= v_month_start and current_period_end < v_now
  )
  select jsonb_build_object(
    'active_at_period_start_30d', (select cnt from active_at where period_start = v_30d_start),
    'active_at_period_start_month', (select cnt from active_at where period_start = v_month_start),
    'churn_last_30_days_pct', case when (select cnt from active_at where period_start = v_30d_start) = 0 then null
      else round(100.0 * (
        (select voluntary_cancel + card_past_due + refunded from lost_30d) + (select cnt from pix_nr_30d)
      ) / (select cnt from active_at where period_start = v_30d_start), 1) end,
    'churn_this_month_pct', case when (select cnt from active_at where period_start = v_month_start) = 0 then null
      else round(100.0 * (
        (select voluntary_cancel + card_past_due + refunded from lost_month) + (select cnt from pix_nr_month)
      ) / (select cnt from active_at where period_start = v_month_start), 1) end,
    'breakdown_last_30_days', jsonb_build_object(
      'voluntary_cancel', (select voluntary_cancel from lost_30d),
      'card_past_due', (select card_past_due from lost_30d),
      'pix_non_renewal', (select cnt from pix_nr_30d),
      'refunded', (select refunded from lost_30d)
    ),
    'breakdown_this_month', jsonb_build_object(
      'voluntary_cancel', (select voluntary_cancel from lost_month),
      'card_past_due', (select card_past_due from lost_month),
      'pix_non_renewal', (select cnt from pix_nr_month),
      'refunded', (select refunded from lost_month)
    ),
    'note', 'voluntary_cancel/card_past_due/refunded vêm de subscription_events (zerado antes deste deploy); pix_non_renewal é calculado ao vivo em subscriptions, pois vencimento silencioso de Pix nunca gera evento.'
  )
  into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_get_churn_stats() to authenticated;

-- =====================================================================
-- admin_get_at_risk_subscribers()
-- =====================================================================
-- Sinais, não certezas — rotulados como tal na UI, nunca "vai cancelar".
create or replace function public.admin_get_at_risk_subscribers()
returns table (user_id uuid, email text, signal text, detail text)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select s.user_id, u.email::text, 'inactive_14d'::text,
    case when max(ue.created_at) is null then 'Nunca gerou conteúdo'
      else 'Sem gerações há ' || extract(day from now() - max(ue.created_at))::text || ' dias' end
  from public.subscriptions s
  join auth.users u on u.id = s.user_id
  left join public.usage_events ue on ue.user_id = s.user_id
  where s.status = 'active' and (s.current_period_end is null or s.current_period_end > now())
  group by s.user_id, u.email
  having max(ue.created_at) is null or max(ue.created_at) < now() - interval '14 days'

  union all
  select s.user_id, u.email::text, 'pix_expiring_soon'::text,
    'Vence em ' || extract(day from s.current_period_end - now())::text || ' dia(s)'
  from public.subscriptions s join auth.users u on u.id = s.user_id
  where s.status = 'active' and s.payment_method = 'pix'
    and s.current_period_end between now() and now() + interval '3 days'

  union all
  select s.user_id, u.email::text, 'pix_expired_unrenewed'::text,
    'Venceu há ' || extract(day from now() - s.current_period_end)::text || ' dia(s)'
  from public.subscriptions s join auth.users u on u.id = s.user_id
  where s.status = 'active' and s.payment_method = 'pix'
    and s.current_period_end is not null and s.current_period_end < now()

  union all
  select s.user_id, u.email::text, 'card_past_due'::text, 'Pagamento de cartão recusado'
  from public.subscriptions s join auth.users u on u.id = s.user_id
  where s.status = 'past_due' and s.payment_method = 'credit_card'

  union all
  select u.id, u.email::text, 'signed_up_never_generated'::text, 'Nenhuma geração desde o cadastro'
  from auth.users u
  where not exists (select 1 from public.usage_events ue where ue.user_id = u.id)
    and not exists (select 1 from public.user_trial_usage_events te where te.user_id = u.id)
    and u.created_at < now() - interval '3 days';
end;
$$;

grant execute on function public.admin_get_at_risk_subscribers() to authenticated;

-- =====================================================================
-- admin_get_trends()
-- =====================================================================
-- Gráficos simples (SVG/CSS inline no componente, sem lib nova). Só
-- ganhos/perdas por mês a partir de subscription_events — não inventa
-- MRR absoluto histórico antes do deploy (impossível reconstruir).
create or replace function public.admin_get_trends()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
begin
  if not public.is_current_user_admin() then
    raise exception 'not authorized';
  end if;

  with months as (
    select date_trunc('month', d)::date as month
    from generate_series(
      date_trunc('month', now()) - interval '11 months',
      date_trunc('month', now()),
      interval '1 month'
    ) as d
  ),
  net_by_month as (
    select date_trunc('month', occurred_at)::date as month,
      count(*) filter (where event_type = 'activated') as gained,
      count(*) filter (where event_type in ('cancelled', 'refunded')) as lost
    from public.subscription_events
    group by 1
  )
  select jsonb_build_object(
    'monthly_net', coalesce(jsonb_agg(jsonb_build_object(
      'month', to_char(m.month, 'YYYY-MM'),
      'gained', coalesce(n.gained, 0),
      'lost', coalesce(n.lost, 0),
      'has_data', n.month is not null
    ) order by m.month), '[]'::jsonb),
    'note', 'MRR/assinantes-ativos absolutos de meses anteriores a este deploy não são reconstruíveis; o gráfico mostra ganhos/perdas por mês a partir de subscription_events.'
  )
  into v_result
  from months m
  left join net_by_month n on n.month = m.month;

  return v_result;
end;
$$;

grant execute on function public.admin_get_trends() to authenticated;
