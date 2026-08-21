import "server-only";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getResendClient, RESEND_FROM } from "./resend-client";

// Só PIX precisa de lembrete — cartão renova sozinho (mesma regra de
// getDaysUntilExpiry em services/billing/subscription.ts).
const REMINDER_WINDOW_DAYS = 3;

function renderReminderHtml(daysLeft: number, renewUrl: string): string {
  const dayWord = daysLeft === 1 ? "dia" : "dias";
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2933;">
      <h1 style="font-size: 20px;">Seu acesso vence em ${daysLeft} ${dayWord}</h1>
      <p>O Pregue Melhor Pro não renova sozinho — quando o prazo acabar, você perde acesso
      às ferramentas e à geração de novo conteúdo (sua Biblioteca continua salva).</p>
      <p>
        <a href="${renewUrl}"
           style="display: inline-block; background: #2f6f4f; color: #fff; padding: 12px 24px;
                  border-radius: 12px; text-decoration: none; font-weight: 600;">
          Renovar com Pix — R$10
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">Pregue Melhor</p>
    </div>
  `;
}

// Roda diariamente (ver src/app/api/cron/renewal-reminders/route.ts).
// Idempotente: renewal_reminder_sent_at evita mandar duas vezes no
// mesmo ciclo, mas reseta sozinho a cada renovação porque comparamos
// com current_period_start, que muda a cada pagamento novo.
export async function sendRenewalReminders(): Promise<{ sent: number; failed: number }> {
  const admin = getSupabaseAdminClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pregue-melhor-novo-gules.vercel.app";

  const { data, error } = await admin
    .from("subscriptions")
    .select("user_id, current_period_start, current_period_end, renewal_reminder_sent_at")
    .eq("status", "active")
    .eq("payment_method", "pix")
    .lte("current_period_end", windowEnd.toISOString())
    .gt("current_period_end", now.toISOString());

  if (error) throw error;

  const pending = (data ?? []).filter((sub) => {
    if (!sub.renewal_reminder_sent_at) return true;
    return new Date(sub.renewal_reminder_sent_at) < new Date(sub.current_period_start);
  });

  let sent = 0;
  let failed = 0;

  for (const sub of pending) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(sub.user_id);
    if (userError || !userData.user?.email) {
      console.error(`[RENEWAL-REMINDER] sem e-mail para user_id=${sub.user_id}`);
      failed++;
      continue;
    }

    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(sub.current_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    try {
      const resend = getResendClient();
      const { error: sendError } = await resend.emails.send({
        from: RESEND_FROM,
        to: userData.user.email,
        subject: `Seu acesso ao Pregue Melhor vence em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`,
        html: renderReminderHtml(daysLeft, `${siteUrl}/planos/pagar`),
      });
      if (sendError) throw sendError;

      const { error: updateError } = await admin
        .from("subscriptions")
        .update({ renewal_reminder_sent_at: now.toISOString() })
        .eq("user_id", sub.user_id);
      if (updateError) throw updateError;

      sent++;
    } catch (err) {
      console.error(`[RENEWAL-REMINDER] falha ao enviar para user_id=${sub.user_id}:`, err);
      failed++;
    }
  }

  console.log(`[RENEWAL-REMINDER] sent=${sent} failed=${failed} candidates=${pending.length}`);
  return { sent, failed };
}
