import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getResendClient, RESEND_FROM } from "./resend-client";

// Só PIX precisa de lembrete — cartão renova sozinho (mesma regra de
// getDaysUntilExpiry em services/billing/subscription.ts). Dois avisos
// distintos (7 dias e 1 dia antes de vencer), cada um com sua própria
// coluna de idempotência em subscriptions — a coluna antiga
// (renewal_reminder_sent_at) vira só a marcação do aviso de 7 dias.
type ReminderUrgency = "7d" | "1d";

type ReminderPass = {
  windowDays: number;
  sentAtColumn: "renewal_reminder_sent_at" | "renewal_reminder_1d_sent_at";
  urgency: ReminderUrgency;
};

const PASSES: ReminderPass[] = [
  { windowDays: 7, sentAtColumn: "renewal_reminder_sent_at", urgency: "7d" },
  { windowDays: 1, sentAtColumn: "renewal_reminder_1d_sent_at", urgency: "1d" },
];

type ReminderCandidate = {
  user_id: string;
  current_period_start: string;
  current_period_end: string;
  renewal_reminder_sent_at: string | null;
  renewal_reminder_1d_sent_at: string | null;
};

function renderReminderHtml(daysLeft: number, renewUrl: string, urgency: ReminderUrgency): string {
  const dayWord = daysLeft === 1 ? "dia" : "dias";
  const heading =
    urgency === "1d" ? "Seu acesso vence amanhã" : `Seu acesso vence em ${daysLeft} ${dayWord}`;
  const body =
    urgency === "1d"
      ? "Últimas horas: quando o prazo acabar você perde acesso às ferramentas e à geração de novo conteúdo (sua Biblioteca continua salva)."
      : "O Pregue Melhor Pro não renova sozinho — quando o prazo acabar, você perde acesso às ferramentas e à geração de novo conteúdo (sua Biblioteca continua salva).";
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2933;">
      <h1 style="font-size: 20px;">${heading}</h1>
      <p>${body}</p>
      <p>
        <a href="${renewUrl}"
           style="display: inline-block; background: #2f6f4f; color: #fff; padding: 12px 24px;
                  border-radius: 12px; text-decoration: none; font-weight: 600;">
          Escolher plano e renovar
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">Pregue Melhor</p>
    </div>
  `;
}

async function runReminderPass(
  admin: SupabaseClient,
  now: Date,
  siteUrl: string,
  pass: ReminderPass,
): Promise<{ sent: number; failed: number }> {
  const windowEnd = new Date(now.getTime() + pass.windowDays * 24 * 60 * 60 * 1000);

  const { data, error } = await admin
    .from("subscriptions")
    .select(`user_id, current_period_start, current_period_end, ${pass.sentAtColumn}`)
    .eq("status", "active")
    .eq("payment_method", "pix")
    .lte("current_period_end", windowEnd.toISOString())
    .gt("current_period_end", now.toISOString());

  if (error) throw error;

  const rows = (data ?? []) as unknown as ReminderCandidate[];
  const pending = rows.filter((sub) => {
    const sentAt = sub[pass.sentAtColumn];
    if (!sentAt) return true;
    return new Date(sentAt) < new Date(sub.current_period_start);
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
        subject:
          pass.urgency === "1d"
            ? "Seu acesso ao Pregue Melhor vence amanhã!"
            : `Seu acesso ao Pregue Melhor vence em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`,
        html: renderReminderHtml(daysLeft, `${siteUrl}/planos`, pass.urgency),
      });
      if (sendError) throw sendError;

      const { error: updateError } = await admin
        .from("subscriptions")
        .update({ [pass.sentAtColumn]: now.toISOString() })
        .eq("user_id", sub.user_id);
      if (updateError) throw updateError;

      sent++;
    } catch (err) {
      console.error(`[RENEWAL-REMINDER] falha ao enviar para user_id=${sub.user_id}:`, err);
      failed++;
    }
  }

  return { sent, failed };
}

// Roda diariamente (ver src/app/api/cron/renewal-reminders/route.ts),
// uma passagem por limiar (7 dias, 1 dia). Um assinante a 1 dia do
// vencimento também bate na janela larga da passagem de 7 dias, mas o
// filtro de idempotência dessa passagem já o exclui (o aviso de 7 dias
// já foi mandado ~6 dias antes) — só a coluna de 1 dia, ainda vazia,
// deixa passar.
export async function sendRenewalReminders(): Promise<{ sent: number; failed: number }> {
  const admin = getSupabaseAdminClient();
  const now = new Date();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pregue-melhor-novo-gules.vercel.app";

  let sent = 0;
  let failed = 0;
  for (const pass of PASSES) {
    const result = await runReminderPass(admin, now, siteUrl, pass);
    sent += result.sent;
    failed += result.failed;
  }

  console.log(`[RENEWAL-REMINDER] sent=${sent} failed=${failed}`);
  return { sent, failed };
}
