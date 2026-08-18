import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, getGenerationStatus, getTrialRemaining } from "@/services/billing";
import { PregacaoForm } from "./Form";

// 60s (teto do plano Hobby da Vercel) — sem isso, a Server Action de
// gerar a pregação usa o padrão de 10s e pode ser derrubada antes da
// Gemini terminar, principalmente na versão "Completa".
export const maxDuration = 60;

// Sem login: trial de 3 gerações grátis por dispositivo (ver
// services/billing/trial.ts) — a rota não é mais protegida pelo proxy.
// Logado sem Pro ativo também cai no trial (por device_id, não reseta
// por login/logout).
export default async function PregacaoPage() {
  const user = await getCurrentUser();

  if (user) {
    const status = await getGenerationStatus(user.id);
    if (status.subscriptionActive) {
      return <PregacaoForm mode="subscriber" initialRemaining={status.dailyRemaining} />;
    }
    const subscription = await getCurrentSubscription(user.id);
    if (subscription) {
      return <PregacaoForm mode="expired" initialRemaining={0} />;
    }
  }

  const trialRemaining = await getTrialRemaining();
  return <PregacaoForm mode="trial" initialRemaining={trialRemaining} />;
}
