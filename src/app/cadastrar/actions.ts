"use server";

import { redirect } from "next/navigation";
import { signUp } from "@/services/auth";

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

  // Sem campo de nome na tela — signUp() aceita nome vazio normalmente
  // (profiles.name fica null, e a Home já usa o e-mail como saudação
  // quando não há nome).
  const result = await signUp("", email, password);

  if (result.status === "error") {
    return { error: result.message, checkEmail: false };
  }

  if (result.status === "check_email") {
    return { error: null, checkEmail: true };
  }

  redirect("/");
}
