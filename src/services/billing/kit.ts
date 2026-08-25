import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/services/database/server-client";

// Acesso ao Kit é PERMANENTE e independente de isSubscriptionActive —
// nunca lê subscriptions. Uma vez concedido, nunca é revogado por
// cancelamento/estorno/vencimento do plano (ver kit_purchases,
// migration 20260824120000).

// Lança em vez de engolir o erro (diferente de recordSubscriptionEvent):
// isto é produto pago de verdade — uma falha silenciosa aqui significa
// cliente pagou e nunca recebeu, sem forma de perceber depois.
export async function grantKitAccess(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin
    .from("kit_purchases")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw error;
}

// Usado por Server Components com a sessão do próprio usuário — RLS
// (select_own_kit_purchase) já isola por usuário, mesmo padrão de
// getCurrentSubscription().
export async function hasKitAccess(userId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("kit_purchases")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

// Estorno do pagamento que incluía o Kit — remove o entitlement.
// kit_purchases só tem user_id (não referencia qual compra concedeu o
// acesso), então isto revoga TODO acesso ao Kit daquele usuário; se ele
// tiver mais de uma compra com Kit incluído e só uma for estornada,
// perde o acesso mesmo tendo pago por outra — caso de borda raro, não
// tratado (exigiria rastrear a origem do entitlement por compra).
export async function revokeKitAccess(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin.from("kit_purchases").delete().eq("user_id", userId);
  if (error) throw error;
}
