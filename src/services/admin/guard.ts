import "server-only";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getSupabaseServerClient } from "@/services/database/server-client";

// Sem sessão: manda pro login normal (redirectTo funciona igual a
// qualquer outra rota protegida). Com sessão mas sem ser admin: 404,
// nunca redirect — não revela que /admin existe pra quem não é admin
// (mesmo padrão de "não vazar existência" já usado em
// getContentById()/fetchOwnedPurchase()). A checagem em si é
// is_current_user_admin() (RPC, RLS zero-policy por trás, ver migration
// 20260823150000) — nunca uma coluna is_admin em profiles, que teria
// policy de update própria do usuário.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/admin");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("is_current_user_admin");
  if (error || !data) {
    notFound();
  }

  return user;
}
