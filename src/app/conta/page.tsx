import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, type SubscriptionStatus } from "@/services/billing";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
  past_due: "Pagamento pendente",
  cancelled: "Cancelada",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ContaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/conta");
  }

  const subscription = await getCurrentSubscription(user.id);
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Minha Conta</h1>
        <p className="text-muted">{user.email}</p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Assinatura
        </h2>

        {subscription ? (
          <div className="flex flex-col gap-2 text-foreground">
            <div className="flex items-center justify-between">
              <span className="text-muted">Plano</span>
              <span className="font-medium">Pregue Melhor Pro</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Valor</span>
              <span className="font-medium">R$14,90/mês</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Status</span>
              <span className="font-medium">{STATUS_LABELS[subscription.status]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Próxima cobrança</span>
              <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
            </div>
          </div>
        ) : (
          <p className="text-foreground">Você ainda não tem uma assinatura.</p>
        )}

        {isPastDue && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            Não conseguimos confirmar sua última cobrança. Verifique o pagamento no
            Mercado Pago para continuar gerando conteúdos novos — sua Biblioteca continua
            disponível normalmente.
          </p>
        )}

        {isActive ? (
          <a
            href="https://www.mercadopago.com.br/subscriptions"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-2xl border border-card-border px-5 font-semibold text-foreground"
          >
            Gerenciar assinatura
          </a>
        ) : (
          <>
            <p className="text-foreground">Sua assinatura não está ativa.</p>
            <Link
              href="/planos"
              className="flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
            >
              Reativar Pregue Melhor Pro
            </Link>
          </>
        )}
      </section>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
