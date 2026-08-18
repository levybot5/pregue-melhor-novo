-- Etapa 7: campos para vincular subscriptions ao provedor de
-- pagamento (Mercado Pago). Nenhuma policy nova — o RLS já existente
-- de subscriptions (select_own_subscription, sem insert/update para
-- authenticated) continua valendo para essas colunas. A única forma
-- de escrever nelas é via client admin (service role), usado apenas
-- pelo webhook (ver relatório desta etapa).

alter table public.subscriptions
  add column if not exists provider text,
  add column if not exists provider_subscription_id text,
  add column if not exists provider_plan_id text;

-- Permite localizar a assinatura pelo id da MP com segurança (não há
-- como duas linhas nossas apontarem para a mesma assinatura externa).
create unique index if not exists subscriptions_provider_subscription_id_idx
  on public.subscriptions (provider_subscription_id)
  where provider_subscription_id is not null;
