"use server";

import { redirect } from "next/navigation";
import { signUp } from "@/services/auth";

export type CadastrarState = { error: string | null; checkEmail: boolean };

export async function signUpAction(
  _prevState: CadastrarState,
  formData: FormData,
): Promise<CadastrarState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha.", checkEmail: false };
  }

  const result = await signUp(name, email, password);

  if (result.status === "error") {
    return { error: result.message, checkEmail: false };
  }

  if (result.status === "check_email") {
    return { error: null, checkEmail: true };
  }

  redirect("/");
}
