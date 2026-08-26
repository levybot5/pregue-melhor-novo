import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, getGenerationStatus, getTrialRemaining } from "@/services/billing";
import { AulaBiblicaForm } from "./Form";

// 60s (teto do plano Hobby da Vercel) — mesmo motivo de /pregacao: sem
// isso a Server Action de gerar a aula usa o padrão de 10s e pode ser
// derrubada antes da Gemini terminar.
export const maxDuration = 60;

// Cadastro é obrigatório antes de chegar aqui (ver proxy.ts) — quem
// nunca assinou cai no trial de 3 gerações grátis por CONTA.
export default async function AulaBiblicaPage() {
  const user = await getCurrentUser();

  if (user) {
    const status = await getGenerationStatus(user.id);
    if (status.subscriptionActive) {
      return <AulaBiblicaForm mode="subscriber" initialRemaining={status.dailyRemaining} />;
    }
    const subscription = await getCurrentSubscription(user.id);
    if (subscription) {
      return <AulaBiblicaForm mode="expired" initialRemaining={0} />;
    }
  }

  const trialRemaining = await getTrialRemaining();
  return <AulaBiblicaForm mode="trial" initialRemaining={trialRemaining} />;
}
