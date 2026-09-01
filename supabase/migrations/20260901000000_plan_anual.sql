-- Plano Anual: constraint antiga só aceitava 'mensal'/'trimestral' em
-- pending_purchases.plan_id — sem essa migration, qualquer tentativa de
-- gerar Pix com plan=anual falhava com violação de check constraint.
alter table public.pending_purchases
  drop constraint if exists pending_purchases_plan_id_check;

alter table public.pending_purchases
  add constraint pending_purchases_plan_id_check
    check (plan_id in ('mensal', 'trimestral', 'anual'));
