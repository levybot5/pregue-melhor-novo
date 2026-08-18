-- Checkout Asaas (PIX avulso + assinatura de cartão). Duas peças novas:
--
-- 1) pending_purchases: rastreia uma compra do momento em que é criada
--    (antes de qualquer pagamento) até ser reivindicada por uma conta.
--    Existe porque o trial roda sem login (device_id) — o pagamento
--    pode acontecer ANTES de existir uma conta (ver item 10/11 do
--    pedido). RLS ligado SEM NENHUMA policy: nem anon nem authenticated
--    tocam nesta tabela diretamente. Todo acesso é via Server
--    Actions/webhook usando o client admin (service role), sempre
--    validando device_id/claimed_by_user_id em código — não existe
--    "policy" possível aqui porque, no momento da criação, pode não
--    haver usuário autenticado nenhum.
--
-- 2) subscriptions.payment_method: para o app saber se uma assinatura
--    ativa é PIX (expira em 30 dias, sem cobrança automática) ou
--    cartão (recorrência real via Asaas) — sem isso, current_period_end
--    sozinho não diz o suficiente sobre o que fazer na renovação.

create table if not exists public.pending_purchases (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  payment_method text not null check (payment_method in ('pix', 'credit_card')),
  provider text not null default 'asaas',
  provider_customer_id text,
  provider_payment_id text,
  provider_subscription_id text,
  provider_checkout_id text,
  amount numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'cancelled')),
  paid_at timestamptz,
  -- Só preenchido para PIX (30 dias fixos a partir da confirmação).
  -- Cartão usa subscriptions.current_period_end, que é atualizado a
  -- cada cobrança recorrente confirmada — não duplicamos essa lógica.
  access_expires_at timestamptz,
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pending_purchases_device_idx
  on public.pending_purchases (device_id);

-- Nunca duas linhas nossas apontando pro mesmo pagamento/checkout da
-- Asaas — junto com "só marca paga se ainda não estava paga" no
-- webhook, isso é a base da idempotência (item 8 do pedido).
create unique index if not exists pending_purchases_provider_payment_idx
  on public.pending_purchases (provider_payment_id)
  where provider_payment_id is not null;

create unique index if not exists pending_purchases_provider_checkout_idx
  on public.pending_purchases (provider_checkout_id)
  where provider_checkout_id is not null;

alter table public.pending_purchases enable row level security;
-- Sem policy nenhuma de propósito — ver comentário no topo do arquivo.
-- Sem updated_at: os timestamps relevantes (paid_at, claimed_at) já
-- são gravados explicitamente pelo código na transição de estado.

alter table public.subscriptions
  add column if not exists payment_method text
    check (payment_method in ('pix', 'credit_card'));
