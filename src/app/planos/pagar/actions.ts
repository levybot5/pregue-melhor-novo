"use server";

import { createPixPurchase, getPurchaseStatus, type PixPurchaseInput } from "@/services/billing";

export type PixPurchaseActionResult =
  | { success: true; purchaseId: string; qrCodeBase64: string; copyPaste: string; expirationDate: string }
  | { success: false; message: string };

export async function createPixPurchaseAction(
  input: PixPurchaseInput,
): Promise<PixPurchaseActionResult> {
  try {
    const result = await createPixPurchase(input);
    return { success: true, ...result };
  } catch (error) {
    console.error("Falha ao criar cobrança PIX:", error);
    return {
      success: false,
      message: "Não foi possível gerar o PIX agora. Tente novamente em instantes.",
    };
  }
}

// createCardCheckoutAction removido daqui (item: cartão fora deste
// lançamento) — o serviço createCardCheckout() em services/billing
// continua existindo, pronto pra reativar sem precisar reescrever
// nada, só falta um botão chamando de novo.

export async function getPurchaseStatusAction(purchaseId: string) {
  return getPurchaseStatus(purchaseId);
}
