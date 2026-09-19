"use server";

import { redirect } from "next/navigation";
import { signUp, getCurrentUser } from "@/services/auth";
import { claimAnyPendingPurchaseForDevice } from "@/services/billing";

export type CadastrarState = { error: string | null; checkEmail: boolean };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signUpAction(
  _prevState: CadastrarState,
  formData: FormData,
): Promise<CadastrarState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (!email || !isValidEmail(email)) {
    return { error: "Digite um e-mail válido.", checkEmail: false };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres.", checkEmail: false };
  }

  const result = await signUp(email, password);

  if (result.status === "error") {
    return { error: result.message, checkEmail: false };
  }

  if (result.status === "check_email") {
    return { error: null, checkEmail: true };
  }

  // Rede de segurança: se este mesmo aparelho tiver um Pix pago e sem
  // dono (ex.: pagou, a aba de espera morreu — comum no Android — e a
  // pessoa cadastrou pelo caminho comum em vez de voltar pro link do
  // pós-pagamento), vincula sozinho. Nunca lança, nunca atrasa o
  // redirect normal do cadastro.
  const user = await getCurrentUser();
  if (user) {
    await claimAnyPendingPurchaseForDevice(user.id);
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}
