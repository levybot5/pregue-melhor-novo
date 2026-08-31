import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, getGenerationStatus, getTrialRemaining } from "@/services/billing";
import { PregacaoForm } from "./Form";

// 60s (teto do plano Hobby da Vercel) — sem isso, a Server Action de
// gerar a pregação usa o padrão de 10s e pode ser derrubada antes da
// Gemini terminar, principalmente na versão "Completa".
export const maxDuration = 60;

// Cadastro é obrigatório antes de chegar aqui (ver proxy.ts) — quem
// nunca assinou cai no trial de 3 gerações grátis por CONTA (ver
// services/billing/trial.ts), não mais por dispositivo.
//
// ?passagem=&notas= são opcionais — só existem quando se chega aqui a
// partir de "Usar este estudo em uma pregação" na Bíblia Guiada (ver
// VerseReader.tsx). Sem eles, o comportamento é idêntico ao de sempre
// (PregacaoForm cai nos próprios valores padrão).
export default async function PregacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ passagem?: string; notas?: string }>;
}) {
  const { passagem, notas } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    const status = await getGenerationStatus(user.id);
    if (status.subscriptionActive) {
      return (
        <PregacaoForm
          mode="subscriber"
          initialRemaining={status.dailyRemaining}
          initialPassage={passagem}
          initialNotes={notas}
        />
      );
    }
    const subscription = await getCurrentSubscription(user.id);
    if (subscription) {
      return <PregacaoForm mode="expired" initialRemaining={0} />;
    }
  }

  const trialRemaining = await getTrialRemaining();
  return (
    <PregacaoForm
      mode="trial"
      initialRemaining={trialRemaining}
      initialPassage={passagem}
      initialNotes={notas}
    />
  );
}
