-- Trimestral (segundo tier PIX) + Kit (produto avulso, acesso
-- permanente, independente de assinatura).

-- =====================================================================
-- pending_purchases: registrar QUAL plano e SE incluiu o Kit nesta
-- compra específica — sem isso, activateSubscriptionFromPurchase não
-- tem como saber quantos dias conceder nem se deve liberar o Kit.
-- Linhas antigas (antes desta migration) ficam com plan_id/duration_days
-- nulos de propósito — o código trata null como "Mensal, 30 dias, sem
-- Kit" (mesmo comportamento de antes, ver purchase.ts).
-- =====================================================================
alter table public.pending_purchases
  add column if not exists plan_id text check (plan_id in ('mensal', 'trimestral')),
  add column if not exists duration_days int,
  add column if not exists includes_kit boolean not null default false;

-- =====================================================================
-- kit_purchases: acesso PERMANENTE ao Kit, nunca revogado por
-- cancelamento/estorno/vencimento de assinatura — por isso é uma
-- tabela própria, nunca uma coluna em subscriptions (que É atrelada ao
-- ciclo de pagamento). Diferente de pending_purchases/subscription_events
-- (RLS sem nenhuma policy): aqui o app PRECISA ler "eu tenho o Kit?" a
-- partir do client com sessão do próprio usuário (mesmo padrão de
-- select_own_subscription), então existe policy de SELECT. Não existe
-- policy de insert/update/delete para "authenticated" — só o client
-- admin (service role), a partir de grantKitAccess(), grava aqui.
-- =====================================================================
create table if not exists public.kit_purchases (
  user_id uuid primary key references auth.users(id) on delete cascade,
  purchased_at timestamptz not null default now()
);

alter table public.kit_purchases enable row level security;

drop policy if exists "select_own_kit_purchase" on public.kit_purchases;
create policy "select_own_kit_purchase"
  on public.kit_purchases
  for select
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- subscriptions: segunda coluna de idempotência de lembrete (1 dia).
-- A coluna existente renewal_reminder_sent_at passa a ser só a do
-- lembrete de 7 dias — sem renomear, pra não quebrar nada em produção.
-- =====================================================================
alter table public.subscriptions
  add column if not exists renewal_reminder_1d_sent_at timestamptz;

-- =====================================================================
-- current_kit_price(): espelho SQL de KIT_PRICE (pricing.ts), mesmo
-- padrão de current_pro_price() (ver 20260824000000) — usado só para
-- a correção de MRR abaixo (não inflar "recorrente" com o valor de um
-- produto avulso).
-- =====================================================================
create or replace function public.current_kit_price()
returns numeric
language sql
security invoker
set search_path = public
immutable
as $$
  select 9.90::numeric;
$$;

grant execute on function public.current_kit_price() to authenticated;

-- =====================================================================
-- admin_get_overview_stats(): corrige o cálculo de "mrr" para dois
-- problemas novos que Trimestral/Kit introduzem no método existente
-- (soma o ÚLTIMO PAGAMENTO REAL de cada assinante ativo):
--   1) Kit embutido no mesmo pagamento infla o valor "recorrente" com
--      um valor de produto avulso — subtrai current_kit_price() do
--      amount quando includes_kit=true antes de usar no cálculo.
--   2) O método antigo assumia implicitamente que todo pagamento cobre
--      exatamente 1 mês (verdade só pro Mensal). Agora normaliza pelo
--      duration_days da própria compra (fallback 30 pra compras
--      legadas/cartão, onde duration_days é sempre null) — Trimestral
--      (R$27/90 dias) passa a contar como R$9/mês equivalente, não
--      R$27/mês.
-- Assinatura de retorno (colunas) não muda — CREATE OR REPLACE é
-- suficiente, sem precisar recriar a função.
-- =====================================================================
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
       greatest(
         coalesce(
           (select
              (case when pp.includes_kit then pp.amount - public.current_kit_price() else pp.amount end)
              / (coalesce(pp.duration_days, 30)::numeric / 30.0)
            from public.pending_purchases pp
            where pp.claimed_by_user_id = s.user_id and pp.status = 'paid'
            order by pp.paid_at desc nulls last
            limit 1),
           public.current_pro_price()
         ),
         0
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
