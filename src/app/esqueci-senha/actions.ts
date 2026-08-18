"use server";

import { requestPasswordReset } from "@/services/auth";

export type EsqueciSenhaState = { submitted: boolean; error: string | null };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function requestPasswordResetAction(
  _prevState: EsqueciSenhaState,
  formData: FormData,
): Promise<EsqueciSenhaState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !isValidEmail(email)) {
    return { submitted: false, error: "Digite um e-mail válido." };
  }

  await requestPasswordReset(email);

  return { submitted: true, error: null };
}
