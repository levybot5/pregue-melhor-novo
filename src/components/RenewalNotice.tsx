import Link from "next/link";

// Distinta de TrialPaywallNotice de propósito: quem já foi assinante e
// venceu (PIX sem renovação automática, ou cartão cancelado) nunca
// deveria ver "seu teste gratuito terminou" — ver reserveGenerationOrTrial()
// em services/billing/guard.ts, reason "subscription_expired".
export function RenewalNotice() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-foreground">Seu acesso venceu</h2>
        <p className="text-sm text-muted">
          Renove por R$10 e receba mais 30 dias de Pregue Melhor Pro.
        </p>
      </div>

      <Link
        href="/planos/pagar"
        className="flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
      >
        Renovar com Pix
      </Link>

      <p className="text-xs text-muted">
        Sua Biblioteca, favoritos e progresso na Academia continuam salvos.
      </p>
    </div>
  );
}
