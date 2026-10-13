"use server";

import { redirect } from "next/navigation";
import { updatePassword, updatePasswordWithToken } from "@/services/auth";

export type RedefinirSenhaState = { error: string | null };

export async function updatePasswordAction(
  _prevState: RedefinirSenhaState,
  formData: FormData,
): Promise<RedefinirSenhaState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const tokenHash = String(formData.get("tokenHash") ?? "");

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const result = tokenHash
    ? await updatePasswordWithToken(tokenHash, password)
    : await updatePassword(password);
  if (result.status === "error") {
    return { error: result.message };
  }

  redirect("/");
}
