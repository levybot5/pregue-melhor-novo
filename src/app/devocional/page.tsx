import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, getGenerationStatus, getTrialRemaining } from "@/services/billing";
import { DevocionalForm } from "./Form";

// 60s (teto do plano Hobby da Vercel) — sem isso, a Server Action de
// gerar o devocional usa o padrão de 10s e pode ser derrubada antes da
// Gemini terminar.
export const maxDuration = 60;

export default async function DevocionalPage() {
  const user = await getCurrentUser();

  if (user) {
    const status = await getGenerationStatus(user.id);
    if (status.subscriptionActive) {
      return <DevocionalForm mode="subscriber" initialRemaining={status.dailyRemaining} />;
    }
    const subscription = await getCurrentSubscription(user.id);
    if (subscription) {
      return <DevocionalForm mode="expired" initialRemaining={0} />;
    }
  }

  const trialRemaining = await getTrialRemaining();
  return <DevocionalForm mode="trial" initialRemaining={trialRemaining} />;
}
