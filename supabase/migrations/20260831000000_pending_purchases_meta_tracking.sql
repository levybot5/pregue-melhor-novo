-- Guarda os cookies do Facebook Pixel (_fbc/_fbp) no momento em que a
-- compra PIX nasce (createPixPurchase) — o PIX confirma minutos depois,
-- muitas vezes fora do navegador (pessoa paga pelo app do banco), então
-- não dá pra depender do navegador estar aberto naquele momento pra
-- mandar o evento de venda pra Meta. Guardando aqui, o webhook da Asaas
-- (syncPixPaymentReceived) lê esses valores e manda junto com o evento
-- Purchase da Conversions API — sem isso a atribuição ao anúncio/
-- criativo exato fica bem mais fraca.
alter table public.pending_purchases
  add column if not exists fbc text,
  add column if not exists fbp text;
