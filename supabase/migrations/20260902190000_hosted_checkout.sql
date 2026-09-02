-- Checkout hospedado da Asaas (Pix + Cartão numa página da própria
-- Asaas, cobrança única — chargeTypes DETACHED, nunca assinatura
-- recorrente). Criado ANTES de saber qual forma de pagamento a pessoa
-- vai escolher na página deles, então payment_method não pode mais
-- ser obrigatório no momento da criação da linha — só é preenchido
-- quando o webhook confirma o pagamento e revela o billingType real.
-- O CHECK existente já aceita NULL automaticamente (não precisa mexer
-- nele), só a obrigatoriedade cai.
alter table public.pending_purchases
  alter column payment_method drop not null;
