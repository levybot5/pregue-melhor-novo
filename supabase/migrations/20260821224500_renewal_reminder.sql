-- Lembrete de vencimento por e-mail (PIX não renova sozinho — sem
-- aviso, quem não abre o app periodicamente pode vencer sem perceber).
-- Guarda quando o último lembrete foi enviado para não mandar duas
-- vezes pro mesmo ciclo — reseta a cada renovação porque
-- current_period_start muda.

alter table public.subscriptions
  add column if not exists renewal_reminder_sent_at timestamptz;
