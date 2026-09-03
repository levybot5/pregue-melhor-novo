import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/services/database/server-client";
import { EBOOK_PRODUCT_ID } from "./pricing";

// Mesmo padrão do Kit (kit.ts): acesso PERMANENTE, independente de
// isSubscriptionActive — nunca lê subscriptions, nunca revogado por
// cancelamento/vencimento do plano. EBOOK_PRODUCT_ID/PRICE/LABEL
// vivem em pricing.ts (sem "server-only", de propósito — PagarForm.tsx
// é Client Component e precisa mostrar o preço).

// Lança em vez de engolir o erro — produto pago de verdade, falha
// silenciosa aqui significa cliente pagou e nunca recebeu.
export async function grantEbookAccess(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin
    .from("ebook_purchases")
    .upsert(
      { user_id: userId, product_id: EBOOK_PRODUCT_ID },
      { onConflict: "user_id,product_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

// Usado por Server Components com a sessão do próprio usuário — RLS
// (select_own_ebook_purchase) já isola por usuário.
export async function hasEbookAccess(userId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ebook_purchases")
    .select("user_id")
    .eq("user_id", userId)
    .eq("product_id", EBOOK_PRODUCT_ID)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

// Estorno do pagamento que incluía o ebook — remove o entitlement.
export async function revokeEbookAccess(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin
    .from("ebook_purchases")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", EBOOK_PRODUCT_ID);
  if (error) throw error;
}
