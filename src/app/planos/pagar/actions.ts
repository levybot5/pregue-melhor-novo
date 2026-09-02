"use server";

import {
  createPixPurchase,
  createHostedCheckout,
  getPurchaseStatus,
  InvalidPixPurchaseInputError,
  type PixPurchaseInput,
  type HostedCheckoutInput,
} from "@/services/billing";

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
    if (error instanceof InvalidPixPurchaseInputError) {
      return { success: false, message: error.message };
    }
    console.error("Falha ao criar cobrança PIX:", error);
    return {
      success: false,
      message: "Não foi possível gerar o PIX agora. Tente novamente em instantes.",
    };
  }
}

export type HostedCheckoutActionResult =
  | { success: true; checkoutUrl: string }
  | { success: false; message: string };

// Checkout hospedado da Asaas (Pix + Cartão na página deles) — não
// exige login: quem chama pode estar anônimo, a compra nasce vinculada
// só ao device_id (ver createHostedCheckout em services/billing).
export async function createHostedCheckoutAction(
  input: HostedCheckoutInput,
): Promise<HostedCheckoutActionResult> {
  try {
    const result = await createHostedCheckout(input);
    return { success: true, checkoutUrl: result.checkoutUrl };
  } catch (error) {
    if (error instanceof InvalidPixPurchaseInputError) {
      return { success: false, message: error.message };
    }
    console.error("Falha ao criar checkout hospedado:", error);
    return {
      success: false,
      message: "Não foi possível abrir o pagamento agora. Tente novamente em instantes.",
    };
  }
}

export async function getPurchaseStatusAction(purchaseId: string) {
  return getPurchaseStatus(purchaseId);
}
