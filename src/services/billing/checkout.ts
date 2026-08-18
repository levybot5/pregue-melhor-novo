import "server-only";
import { createSubscriptionCheckout } from "./providers/mercadopago";

export type CheckoutResult =
  | { success: true; checkoutUrl: string }
  | { success: false; message: string };

// Ponto único que a UI/actions chamam para iniciar uma assinatura. Não
// conhece nada de Mercado Pago além de "existe um provider que sabe
// criar um checkout" — trocar de gateway no futuro não muda esta
// assinatura de função.
export async function startSubscriptionCheckout(
  userId: string,
  email: string,
): Promise<CheckoutResult> {
  try {
    const checkoutUrl = await createSubscriptionCheckout({ userId, email });
    return { success: true, checkoutUrl };
  } catch (error) {
    console.error("Falha ao iniciar checkout de assinatura:", error);
    return {
      success: false,
      message: "Não foi possível iniciar a assinatura agora. Tente novamente.",
    };
  }
}
