-- Produto novo, independente da assinatura: ebook "Apocalipse
-- Simplificado" (PDF), R$12,90, acesso PERMANENTE (mesmo padrão do
-- Kit — nunca revogado por cancelamento/vencimento de assinatura,
-- então é tabela própria, não coluna em subscriptions). Vendido em
-- dois lugares: order bump em /planos/pagar (junto do plano) e
-- avulso dentro da Academia, pra quem já é assinante. Entrega: o PDF
-- fica só linkado de dentro da Academia pra quem tem o entitlement —
-- mesmo modelo de "protegido por só não estar linkado em outro
-- lugar" que os vídeos/materiais de curso já usam (proxy.ts exclui
-- /videos, /images etc. do gate de auth).

-- includes_ebook: comprado JUNTO de um plano (order bump em
-- /planos/pagar) -- ativação continua passando por
-- activateSubscriptionFromPurchase (mesmo caminho do Kit), só ganha
-- mais um grant de acesso.
-- is_ebook_only: comprado AVULSO dentro da Academia, sem plano nenhum
-- -- essa compra nunca deve tocar em subscriptions (senão criaria/
-- sobrescreveria uma assinatura "pro" pra quem só quis o ebook). Sinal
-- explícito em vez de reaproveitar plan_id null, que já significa
-- "Mensal legado" em linhas antigas.
alter table public.pending_purchases
  add column if not exists includes_ebook boolean not null default false,
  add column if not exists is_ebook_only boolean not null default false;

-- product_id como texto (não boolean) desde já pensando em mais
-- ebooks no futuro, sem precisar de tabela nova a cada um.
create table if not exists public.ebook_purchases (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null default 'apocalipse-simplificado',
  purchased_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.ebook_purchases enable row level security;

drop policy if exists "select_own_ebook_purchase" on public.ebook_purchases;
create policy "select_own_ebook_purchase"
  on public.ebook_purchases
  for select
  to authenticated
  using (auth.uid() = user_id);
