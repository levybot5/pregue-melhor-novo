import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, getGenerationStatus, getTrialRemaining } from "@/services/billing";
import { EsbocoPregacaoForm } from "./Form";

// 60s (teto do plano Hobby da Vercel) — sem isso, a Server Action de
// gerar o esboço usa o padrão de 10s e pode ser derrubada antes da
// Gemini terminar.
export const maxDuration = 60;

export default async function EsbocoPregacaoPage() {
  const user = await getCurrentUser();

  if (user) {
    const status = await getGenerationStatus(user.id);
    if (status.subscriptionActive) {
      return <EsbocoPregacaoForm mode="subscriber" initialRemaining={status.dailyRemaining} />;
    }
    const subscription = await getCurrentSubscription(user.id);
    if (subscription) {
      return <EsbocoPregacaoForm mode="expired" initialRemaining={0} />;
    }
  }

  const trialRemaining = await getTrialRemaining();
  return <EsbocoPregacaoForm mode="trial" initialRemaining={trialRemaining} />;
}
