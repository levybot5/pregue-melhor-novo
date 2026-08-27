import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import {
  getCurrentSubscription,
  getDaysUntilExpiry,
  PLANS,
  isPlanId,
  type SubscriptionStatus,
} from "@/services/billing";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";

const SUPPORT_WHATSAPP_URL = "https://wa.me/5591982486230?text=Quero%20suporte%20no%20Pregue%20Melhor";

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
  const daysUntilExpiry = getDaysUntilExpiry(subscription);
  const planId = subscription && isPlanId(subscription.plan) ? subscription.plan : null;
  const planValueLabel = planId
    ? `R$${PLANS[planId].price.toFixed(2).replace(".", ",")} / ${PLANS[planId].days} dias`
    : "R$10/mês";

  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
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
              <span className="font-medium">{planValueLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Status</span>
              <span className="font-medium">{STATUS_LABELS[subscription.status]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Vence em</span>
              <span className="font-medium">
                {formatDate(subscription.current_period_end)}
                {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                  <span className="text-muted"> ({daysUntilExpiry} dias)</span>
                )}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-foreground">Você ainda não tem uma assinatura.</p>
        )}

        {isPastDue && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            Não conseguimos confirmar seu último pagamento. Sua Biblioteca continua
            disponível normalmente, mas gerar conteúdo novo pode estar bloqueado.
          </p>
        )}

        {isActive ? (
          <>
            <p className="text-sm text-muted">
              Pix não renova sozinho — quando estiver perto de vencer, é só pagar de novo
              pra continuar com acesso.
            </p>
            <Link
              href="/planos"
              className="flex min-h-[48px] items-center justify-center rounded-2xl border border-card-border px-5 font-semibold text-foreground"
            >
              Renovar com Pix
            </Link>
          </>
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

      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-[48px] items-center justify-center rounded-2xl border border-card-border bg-card px-5 font-semibold text-foreground"
      >
        Falar com o suporte
      </a>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>

      <DeleteAccountButton />
      </main>
      <BottomNav />
    </>
  );
}
