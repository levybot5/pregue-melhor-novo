"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/services/auth";

export type EntrarState = { error: string | null };

export async function signInAction(
  _prevState: EntrarState,
  formData: FormData,
): Promise<EntrarState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const result = await signIn(email, password);

  if (result.status === "error") {
    return { error: result.message };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/biblioteca");
}
