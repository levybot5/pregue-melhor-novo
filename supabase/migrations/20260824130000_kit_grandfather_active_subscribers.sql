-- Grandfather: quem JÁ é assinante ATIVO agora (isSubscriptionActive
-- verdadeiro neste exato momento — is_subscription_row_active espelha
-- essa regra em SQL, ver migration 20260824000000) ganha acesso
-- PERMANENTE e gratuito ao Kit Pregue Com Segurança, porque os 3
-- materiais eram livres pra qualquer logado até agora. Quem virar
-- assinante A PARTIR de hoje não entra aqui — precisa comprar o Kit
-- como todo mundo novo (checkbox no checkout, R$9,90).
--
-- Isto é um backfill de DADOS de execução única — captura quem está
-- ativo NO MOMENTO em que este script roda, não uma regra permanente.
-- Rodar uma vez só, hoje. on conflict do nothing: seguro rodar de novo
-- sem duplicar, mas rodar depois de hoje vai grandfatherar gente nova
-- que ficou ativa nesse meio tempo — não é a intenção, então não
-- reexecutar depois do dia em que foi combinado.
insert into public.kit_purchases (user_id, purchased_at)
select s.user_id, now()
from public.subscriptions s
where public.is_subscription_row_active(s.status, s.current_period_end)
on conflict (user_id) do nothing;
