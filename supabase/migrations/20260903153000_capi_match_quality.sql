-- Qualidade de correspondência do Purchase via Conversions API estava
-- em 4.6/10 no Gerenciador de Eventos da Meta ("Atualização
-- recomendada") -- só mandávamos e-mail (quando tinha)/fbc/fbp. IP e
-- user-agent de quem comprou são os dois parâmetros que a própria Meta
-- mais recomenda pra subir esse número, e nenhum dos dois vinha sendo
-- capturado. Só dá pra pegar esses dois no momento da COMPRA (o
-- navegador de quem está comprando), não no webhook (que é a Asaas
-- chamando nosso servidor, não a pessoa) -- por isso guarda aqui pra
-- usar depois, quando o pagamento confirmar.
alter table public.pending_purchases
  add column if not exists client_ip text,
  add column if not exists client_user_agent text;
