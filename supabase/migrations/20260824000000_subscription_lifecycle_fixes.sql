-- Revisão final antes do lançamento — 2 correções:
--
-- 1) "é Pro agora" precisa concordar em TODO lugar que reimplementa
--    esse predicado. isSubscriptionActive() (TypeScript) mudou pra
--    não cortar acesso na hora quando status='cancelled' (cancelamento
--    de renovação) ou 'past_due' — só quando current_period_end já
--    passou de verdade. As RPCs do painel admin reimplementavam o
--    predicado antigo em SQL (só status='active') — aqui elas passam a
--    usar a mesma função helper, pra nunca mais divergir.
--
-- 2) MRR deixa de assumir "todo assinante paga R$10" — passa a somar o
--    valor REAL do último pagamento de cada um (pending_purchases.amount),
--    caindo no preço atual só como estimativa quando não existe
--    pagamento registrado (ex.: acesso concedido manualmente).

-- =====================================================================
-- is_subscription_row_active(p_status, p_current_period_end)
-- =====================================================================
-- Espelha EXATAMENTE isSubscriptionActive() (src/services/billing/subscription.ts):
--   status='inactive' -> false
--   status='active' e sem current_period_end -> true (nunca vence)
--   qualquer outro caso -> current_period_end > agora
-- 'cancelled'/'past_due' caem na mesma checagem de data que 'active' —
-- cancelamento de renovação não é revogação imediata; revogação
-- imediata (estorno/chargeback) já zera current_period_end no momento
-- do evento (ver syncPaymentRefunded), então cai aqui naturalmente.
create or replace function public.is_subscription_row_active(
  p_status text,
  p_current_period_end timestamptz
)
returns boolean
language sql
security invoker
set search_path = public
immutable
as $$
  select case
    when p_status = 'inactive' or p_status is null then false
    when p_status = 'active' and p_current_period_end is null then true
    else p_current_period_end is not null and p_current_period_end > now()
  end;
$$;

grant execute on function public.is_subscription_row_active(text, timestamptz) to authenticated;

-- =====================================================================
-- current_pro_price() — espelho SQL de PRO_PRICE (src/services/billing/pricing.ts)
-- =====================================================================
-- Único lugar do lado do banco que sabe o preço atual — usado só como
-- ESTIMATIVA de MRR pra assinante sem pagamento registrado (ex.:
-- acesso concedido manualmente, sem pending_purchases correspondente).
-- Se o preço mudar, atualizar aqui E em pricing.ts (são runtimes
-- diferentes, não dá pra compartilhar uma constante só entre TS e SQL
-- sem uma tabela de configuração — fora de escopo desta revisão).
create or replace function public.current_pro_price()
returns numeric
language sql
security invoker
set search_path = public
immutable
as $$
  select 10::numeric;
$$;

grant execute on function public.current_pro_price() to authenticated;

-- =====================================================================
-- admin_get_overview_stats() — active_subscribers/mrr/pix_active_count/
-- card_active_count agora usam is_subscription_row_active(); mrr passa
-- a somar o valor real de cada assinante. expired_unrenewed_count NÃO
-- muda — continua checando status='active' literal, porque mede
-- exatamente "ainda marcado ativo no banco, mas a data já passou sem
-- nenhum evento ter rebaixado" (só existe pra Pix, que nunca recebe um
-- evento de cancelamento).
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
       where public.is_subscription_row_active(status, current_period_end))::int,
    (select count(*) from public.subscriptions
       where created_at >= date_trunc('month', now())
         and created_at < date_trunc('month', now()) + interval '1 month')::int,
    (select count(*) from public.subscription_events
       where event_type = 'cancelled'
         and occurred_at >= date_trunc('month', now())
         and occurred_at < date_trunc('month', now()) + interval '1 month')::int,
    (select count(*) from public.subscriptions where status = 'past_due')::int,
    (select count(*) from public.subscriptions
       where status = 'active' and payment_method = 'pix'
         and current_period_end is not null and current_period_end <= now())::int,
    (select coalesce(sum(
       coalesce(
         (select pp.amount from public.pending_purchases pp
            where pp.claimed_by_user_id = s.user_id and pp.status = 'paid'
            order by pp.paid_at desc nulls last
            limit 1),
         public.current_pro_price()
       )
     ), 0)
     from public.subscriptions s
     where public.is_subscription_row_active(s.status, s.current_period_end))::numeric,
    (select coalesce(sum(amount), 0) from public.pending_purchases
       where status = 'paid'
         and paid_at >= date_trunc('month', now())
         and paid_at < date_trunc('month', now()) + interval '1 month')::numeric,
    (select count(*) from public.subscriptions
       where payment_method = 'pix' and public.is_subscription_row_active(status, current_period_end))::int,
    (select count(*) from public.subscriptions
       where payment_method = 'credit_card' and public.is_subscription_row_active(status, current_period_end))::int;
end;
$$;

grant execute on function public.admin_get_overview_stats() to authenticated;

-- =====================================================================
-- admin_get_usage_stats() — "assinante ativo" (base da média e da
-- distribuição) agora usa is_subscription_row_active().
-- =====================================================================
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
      where public.is_subscription_row_active(s.status, s.current_period_end)
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
        where public.is_subscription_row_active(s.status, s.current_period_end)
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
-- admin_get_at_risk_subscribers() — só o sinal "inactive_14d" muda pra
-- usar is_subscription_row_active(); os sinais de Pix (vencendo/vencido)
-- e cartão past_due continuam checando o status literal de propósito
-- (são sobre o próprio estado bruto, não sobre "tem acesso agora").
-- =====================================================================
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
  where public.is_subscription_row_active(s.status, s.current_period_end)
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
