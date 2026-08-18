"use server";

import { redirect } from "next/navigation";
import { signUp } from "@/services/auth";
import { claimPendingPurchase } from "@/services/billing";

export type AsaasSignupState = { error: string | null; checkEmail: boolean };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mesma validação de /cadastrar/actions.ts (sem campo de nome — ver
// item 12 do pedido: só e-mail, senha e confirmar senha). A diferença
// é o passo extra depois do signUp: vincular a compra já paga à conta
// recém-criada, uma única vez (claimPendingPurchase cuida da
// segurança — device_id + "só reivindica se ainda não tinha dono").
export async function signUpAndClaimAction(
  purchaseId: string,
  _prevState: AsaasSignupState,
  formData: FormData,
): Promise<AsaasSignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !isValidEmail(email)) {
    return { error: "Digite um e-mail válido.", checkEmail: false };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres.", checkEmail: false };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem.", checkEmail: false };
  }

  const result = await signUp("", email, password);

  if (result.status === "error") {
    return { error: result.message, checkEmail: false };
  }
  if (result.status === "check_email") {
    // Projeto com confirmação de e-mail obrigatória: sem sessão ainda,
    // não dá pra vincular agora. A compra continua "paga, não
    // reivindicada" — a pessoa vincula ao confirmar e entrar (mesmo
    // botão "Já tenho uma conta" já resolve isso).
    return { error: null, checkEmail: true };
  }

  const claim = await claimPendingPurchase(purchaseId);
  if (!claim.success) {
    return { error: claim.message, checkEmail: false };
  }

  redirect("/");
}
