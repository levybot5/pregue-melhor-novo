import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { hasKitAccess } from "@/services/billing";
import { KIT_SECTION_ANCHOR } from "@/lib/academy/kit-materials";

// O Kit não tem conteúdo próprio — são os mesmos 3 materiais que já
// vivem em /academia (ver KIT_MATERIALS), só que agora atrás do
// entitlement do Kit em vez de livres pra qualquer logado. Esta rota
// só existe como link curto de pós-compra: confirma o acesso e manda
// direto pra seção certa, sem duplicar nada aqui.
export default async function KitPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/kit");
  }

  const owns = await hasKitAccess(user.id);
  if (!owns) {
    redirect("/planos/pagar");
  }

  redirect(`/academia#${KIT_SECTION_ANCHOR}`);
}
