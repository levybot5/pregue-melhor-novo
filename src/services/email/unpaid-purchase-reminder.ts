import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getResendClient, RESEND_FROM, RESEND_REPLY_TO } from "./resend-client";
import { PLANS, isPlanId } from "@/services/billing/pricing";

// Só alcança quem estava LOGADO no momento de gerar o Pix
// (claimed_by_user_id já vem preenchido nesse caso — ver
// createPixPurchase em services/billing/purchase.ts) — é o único caso
// em que temos e-mail: o checkout anônimo, por design, só pede
// nome+CPF (fricção mínima de propósito), nunca e-mail. Pra quem
// pagou anônimo e nunca fez conta, não tem como avisar por e-mail —
// se ele cadastrar depois no mesmo aparelho, o pagamento se vincula
// sozinho (ver claimAnyPendingPurchaseForDevice).
const MIN_AGE_HOURS = 2;
const MAX_AGE_HOURS = 48;

type UnpaidCandidate = {
  id: string;
  claimed_by_user_id: string;
  plan_id: string | null;
  amount: number;
};

function formatPrice(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function renderReminderHtml(planLabel: string, amount: number, payUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2933;">
      <h1 style="font-size: 20px;">Seu Pix ainda não foi pago</h1>
      <p>Você começou a assinar o Pregue Melhor Pro (${planLabel} — R$${formatPrice(amount)}), mas o pagamento não foi confirmado.</p>
      <p>Se ainda tiver interesse, é só gerar um novo Pix — leva menos de um minuto.</p>
      <p>
        <a href="${payUrl}"
           style="display: inline-block; background: #2f6f4f; color: #fff; padding: 12px 24px;
                  border-radius: 12px; text-decoration: none; font-weight: 600;">
          Finalizar assinatura
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">
        Equipe Pregue Melhor<br />
        Dúvidas? É só responder este e-mail.
      </p>
    </div>
  `;
}

function renderReminderText(planLabel: string, amount: number, payUrl: string): string {
  return `Seu Pix ainda não foi pago\n\nVocê começou a assinar o Pregue Melhor Pro (${planLabel} — R$${formatPrice(amount)}), mas o pagamento não foi confirmado.\n\nSe ainda tiver interesse, é só gerar um novo Pix — leva menos de um minuto.\n\nFinalizar assinatura: ${payUrl}\n\nEquipe Pregue Melhor\nDúvidas? É só responder este e-mail.`;
}

async function sendOneReminder(
  admin: SupabaseClient,
  now: Date,
  siteUrl: string,
  purchase: UnpaidCandidate,
): Promise<boolean> {
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(
    purchase.claimed_by_user_id,
  );
  if (userError || !userData.user?.email) {
    console.error(`[UNPAID-REMINDER] sem e-mail para user_id=${purchase.claimed_by_user_id}`);
    return false;
  }

  const planLabel = isPlanId(purchase.plan_id) ? PLANS[purchase.plan_id].label : "Pregue Melhor Pro";

  try {
    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: RESEND_FROM,
      replyTo: RESEND_REPLY_TO,
      to: userData.user.email,
      subject: "Seu Pix do Pregue Melhor ainda não foi pago",
      html: renderReminderHtml(planLabel, purchase.amount, `${siteUrl}/planos/pagar`),
      text: renderReminderText(planLabel, purchase.amount, `${siteUrl}/planos/pagar`),
    });
    if (sendError) throw sendError;

    const { error: updateError } = await admin
      .from("pending_purchases")
      .update({ abandoned_reminder_sent_at: now.toISOString() })
      .eq("id", purchase.id);
    if (updateError) throw updateError;

    return true;
  } catch (err) {
    console.error(`[UNPAID-REMINDER] falha ao enviar para purchase_id=${purchase.id}:`, err);
    return false;
  }
}

// Roda periodicamente (ver src/app/api/cron/unpaid-purchase-reminders/route.ts).
// Um único aviso por compra (idempotência via abandoned_reminder_sent_at),
// só pra quem tinha conta no momento da compra.
export async function sendUnpaidPurchaseReminders(): Promise<{ sent: number; failed: number }> {
  const admin = getSupabaseAdminClient();
  const now = new Date();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pregue-melhor-novo-gules.vercel.app";

  const windowStart = new Date(now.getTime() - MAX_AGE_HOURS * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() - MIN_AGE_HOURS * 60 * 60 * 1000);

  const { data, error } = await admin
    .from("pending_purchases")
    .select("id, claimed_by_user_id, plan_id, amount")
    .eq("status", "pending")
    .not("claimed_by_user_id", "is", null)
    .is("abandoned_reminder_sent_at", null)
    .gte("created_at", windowStart.toISOString())
    .lte("created_at", windowEnd.toISOString());
  if (error) throw error;

  const rows = (data ?? []) as UnpaidCandidate[];

  let sent = 0;
  let failed = 0;
  for (const purchase of rows) {
    const ok = await sendOneReminder(admin, now, siteUrl, purchase);
    if (ok) sent++;
    else failed++;
  }

  console.log(`[UNPAID-REMINDER] sent=${sent} failed=${failed}`);
  return { sent, failed };
}
