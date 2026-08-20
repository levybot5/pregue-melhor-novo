"use server";

import { deleteOwnAccount, type AuthActionResult } from "@/services/auth";

export async function deleteAccountAction(): Promise<AuthActionResult> {
  return deleteOwnAccount();
}
