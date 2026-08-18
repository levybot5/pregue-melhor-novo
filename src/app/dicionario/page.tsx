import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, getGenerationStatus, getTrialRemaining } from "@/services/billing";
import { DicionarioForm } from "./Form";

// 60s (teto do plano Hobby da Vercel) — sem isso, a Server Action de
// buscar o verbete usa o padrão de 10s e pode ser derrubada antes da
// Gemini terminar.
export const maxDuration = 60;

export default async function DicionarioPage() {
  const user = await getCurrentUser();

  if (user) {
    const status = await getGenerationStatus(user.id);
    if (status.subscriptionActive) {
      return <DicionarioForm mode="subscriber" initialRemaining={status.dailyRemaining} />;
    }
    // Já assinou antes (Pix vencido, cartão cancelado) — nunca cai no
    // trial, senão o botão fica desabilitado por "0 testes disponíveis"
    // e a pessoa nunca chega a ver o aviso de renovação.
    const subscription = await getCurrentSubscription(user.id);
    if (subscription) {
      return <DicionarioForm mode="expired" initialRemaining={0} />;
    }
  }

  const trialRemaining = await getTrialRemaining();
  return <DicionarioForm mode="trial" initialRemaining={trialRemaining} />;
}
