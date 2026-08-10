import Link from "next/link";

const BENEFITS = [
  "Pregação Completa",
  "Bíblia Explicada",
  "Esboço em Pregação",
  "Esboço para Púlpito",
  "Biblioteca com salvamento automático",
  "Até 20 gerações por dia",
];

// Página temporária: ainda sem checkout/pagamento integrado.
export default function PlanosPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pregue Melhor Pro
        </h1>
        <p className="text-muted">Tudo que você precisa para preparar suas mensagens.</p>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6 shadow-sm">
        <p className="text-3xl font-bold text-foreground">
          R$14,90<span className="text-base font-medium text-muted">/mês</span>
        </p>

        <ul className="flex flex-col gap-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-foreground">
              <span className="text-primary">✓</span>
              {benefit}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground opacity-60"
        >
          Assinatura em breve
        </button>
      </div>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
