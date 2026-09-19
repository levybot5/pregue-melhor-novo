import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { recordSubscriptionEvent, type SubscriptionStatusValue } from "./subscription-events";
import { getSupabaseServerClient } from "@/services/database/server-client";

// Visível na interface (/conta) — ambos os lados ganham o mesmo tanto.
export const REFERRAL_BONUS_DAYS = 15;

// Cookie que carrega o ?ref=<user_id> de um link compartilhado, do
// primeiro toque (gravado pelo proxy.ts) até o cadastro de verdade
// (lido em services/auth/index.ts signUp()) — mesmo padrão do
// DEVICE_ID_COOKIE em ./device.ts, constante vive no lado de serviço,
// nunca no proxy.
export const REFERRAL_COOKIE = "pm_ref";

// Chamada de dentro de activateSubscriptionFromPurchase() — o único
// ponto por onde toda ativação de PAGAMENTO REAL passa (grants manuais
// via script nunca passam por pending_purchases/esta função, então
// nunca disparam bônus de indicação por engano). referredUserId é
// quem acabou de pagar; se ele tiver um referred_by e ainda não tiver
// sido premiado, os dois ganham REFERRAL_BONUS_DAYS.
//
// Nunca lança: uma falha aqui não pode reverter a ativação da
// assinatura de quem pagou — o pagamento em si já foi processado com
// sucesso antes desta chamada.
export async function grantReferralRewardIfEligible(
  admin: SupabaseClient,
  referredUserId: string,
): Promise<void> {
  try {
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("referred_by")
      .eq("id", referredUserId)
      .maybeSingle();
    if (profileError) throw profileError;

    const referrerUserId = profile?.referred_by as string | null | undefined;
    if (!referrerUserId) return;

    // Chave primária em referral_rewards é o próprio referredUserId —
    // este insert falha (unique_violation) se já foi premiado antes,
    // o que garante que o bônus nunca é concedido duas vezes mesmo com
    // retries. Inserida ANTES de mexer em subscriptions: se outra
    // chamada concorrente já reservou, a nossa simplesmente para aqui.
    const { error: rewardError } = await admin.from("referral_rewards").insert({
      referred_user_id: referredUserId,
      referrer_user_id: referrerUserId,
      referrer_bonus_days: REFERRAL_BONUS_DAYS,
      referred_bonus_days: REFERRAL_BONUS_DAYS,
    });
    if (rewardError) {
      if (rewardError.code === "23505") return; // já premiado antes — nada a fazer
      throw rewardError;
    }

    await Promise.all([
      extendSubscriptionByDays(admin, referredUserId, REFERRAL_BONUS_DAYS),
      extendSubscriptionByDays(admin, referrerUserId, REFERRAL_BONUS_DAYS),
    ]);
  } catch (error) {
    console.error("[REFERRAL] falha ao conceder bonus de indicacao (não bloqueia o pagamento):", error);
  }
}

// Mesma conta de "renovar sem perder dias que sobravam" já usada em
// activateSubscriptionFromPurchase: base é o maior entre agora e o
// vencimento atual, some os dias por cima. payment_method null e
// provider "referral" de propósito — não é uma compra real, não deve
// contar como Pix/cartão nas métricas de receita.
async function extendSubscriptionByDays(
  admin: SupabaseClient,
  userId: string,
  days: number,
): Promise<void> {
  const now = new Date();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const existingEnd = existing?.current_period_end
    ? new Date(existing.current_period_end as string)
    : null;
  const base = existingEnd && existingEnd > now ? existingEnd : now;
  const newEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "pro",
      status: "active",
      payment_method: null,
      provider: "referral",
      current_period_start: now.toISOString(),
      current_period_end: newEnd.toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;

  const previousStatus = (existing?.status as SubscriptionStatusValue | undefined) ?? null;
  await recordSubscriptionEvent(admin, {
    userId,
    eventType: previousStatus === "active" ? "renewed" : "activated",
    previousStatus,
    newStatus: "active",
    paymentMethod: null,
  });
}

// Pra mostrar "você já indicou N pessoas" em /conta — usa o client com
// sessão do próprio usuário, RLS (select_own_referral_rewards) já
// garante que só suas próprias indicações são contadas.
export async function getReferralCount(userId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const { count, error } = await supabase
    .from("referral_rewards")
    .select("referred_user_id", { count: "exact", head: true })
    .eq("referrer_user_id", userId);
  if (error) throw error;
  return count ?? 0;
}
