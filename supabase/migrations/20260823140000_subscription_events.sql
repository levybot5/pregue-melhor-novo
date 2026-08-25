-- Trilha de auditoria de mudanças de status de assinatura — só para
-- métricas (churn, MRR-ao-longo-do-tempo, coorte), NUNCA para decidir
-- "é Pro" (isso continua sendo isSubscriptionActive/subscriptions, ver
-- services/billing/subscription.ts). Tabela nasce VAZIA — nenhum
-- backfill é possível (não existe histórico de transições hoje), então
-- qualquer métrica que dependa dela mostra honestamente "sem dados
-- suficientes" para períodos anteriores a este deploy.
--
-- Mesmo padrão de pending_purchases: RLS ligado, ZERO policies — só o
-- client admin (service role) escreve, a partir de
-- activateSubscriptionFromPurchase() e dos escritores de
-- asaas-webhook-sync.ts (cancelamento/inadimplência/estorno). Leitura
-- só via as funções admin_* (próxima migration).

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null
    check (event_type in ('activated', 'renewed', 'past_due', 'cancelled', 'refunded')),
  previous_status text
    check (previous_status in ('active', 'inactive', 'past_due', 'cancelled')),
  new_status text not null
    check (new_status in ('active', 'inactive', 'past_due', 'cancelled')),
  payment_method text check (payment_method in ('pix', 'credit_card')),
  amount numeric(10, 2),
  occurred_at timestamptz not null default now()
);

create index if not exists subscription_events_user_occurred_idx
  on public.subscription_events (user_id, occurred_at);

-- Toda métrica de churn/coorte filtra por tipo + janela de tempo.
create index if not exists subscription_events_type_occurred_idx
  on public.subscription_events (event_type, occurred_at);

alter table public.subscription_events enable row level security;
-- Sem nenhuma policy de propósito — ver comentário no topo do arquivo.
