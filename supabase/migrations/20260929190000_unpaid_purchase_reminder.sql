-- Lembrete pra quem gerou um Pix e não pagou (carrinho abandonado) —
-- só alcança quem estava logado no momento da compra (claimed_by_user_id
-- já vem preenchido nesse caso, ver createPixPurchase em
-- services/billing/purchase.ts), porque é o único caso em que temos
-- e-mail: o checkout anônimo por design só pede nome+CPF, nunca e-mail
-- (fricção mínima de propósito).

alter table public.pending_purchases
  add column if not exists abandoned_reminder_sent_at timestamptz;
