import Link from "next/link";
import { PLANS } from "@/services/billing/pricing";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";

function formatPrice(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

const TRIMESTRAL_MONTHLY_EQUIVALENT = formatPrice(PLANS.trimestral.price / 3);

export default function PlanosPage() {
  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pregue Melhor Pro
        </h1>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-card p-6 shadow-sm">
        <span className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
          Mais vantajoso
        </span>
        <div>
          <p className="text-3xl font-bold text-foreground">
            R${formatPrice(PLANS.trimestral.price)}
            <span className="text-base font-medium text-muted"> / {PLANS.trimestral.days} dias</span>
          </p>
          <p className="text-sm text-muted">Equivale a R${TRIMESTRAL_MONTHLY_EQUIVALENT}/mês</p>
        </div>

        <Link
          href="/planos/pagar?plan=trimestral"
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold uppercase tracking-wide text-primary-foreground"
        >
          ASSINAR 3 MESES
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6 shadow-sm">
        <div>
          <p className="text-3xl font-bold text-foreground">
            R${formatPrice(PLANS.mensal.price)}
            <span className="text-base font-medium text-muted"> / {PLANS.mensal.days} dias</span>
          </p>
          <p className="text-sm text-muted">Sem compromisso, cancele quando quiser</p>
        </div>

        <Link
          href="/planos/pagar?plan=mensal"
          className="flex min-h-[52px] items-center justify-center rounded-2xl border border-card-border px-5 font-semibold text-foreground"
        >
          ASSINAR MENSAL
        </Link>
      </div>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
      </main>
      <BottomNav />
    </>
  );
}
