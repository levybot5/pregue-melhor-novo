import Link from "next/link";

// Só aparece quando o usuário TENTA uma 4ª geração depois de esgotar o
// trial (nunca automaticamente ao terminar a 3ª) — ver
// reserveGenerationOrTrial() em services/billing/guard.ts, que bloqueia
// antes de qualquer chamada ao Gemini.
export function TrialPaywallNotice() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-foreground">Seu teste gratuito terminou</h2>
        <p className="text-sm text-muted">Você já utilizou suas 3 gerações gratuitas.</p>
      </div>

      <p className="text-sm text-foreground">
        Continue usando todas as ferramentas do Pregue Melhor.
      </p>

      {/* Sem preço fixo aqui de propósito — já tivemos essa tela mostrando
          só "R$10/mês" sem citar o Trimestral (destacado como "mais
          vantajoso" em /planos), deixando quem esgota o teste sem saber
          que tinha opção melhor. Manda pra /planos, que sempre mostra os
          planos reais e atualizados, em vez de duplicar preço aqui. */}
      <Link
        href="/planos"
        className="mx-auto flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-primary px-6 font-semibold uppercase tracking-wide text-primary-foreground"
      >
        Ver planos
      </Link>
    </div>
  );
}
