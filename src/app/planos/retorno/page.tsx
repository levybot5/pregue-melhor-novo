import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getCurrentSubscription, getPurchaseStatus, claimPendingPurchase } from "@/services/billing";
import { syncSubscriptionFromPreapproval } from "@/services/billing/subscription-sync";
import { AuthLogo } from "@/components/AuthLogo";
import { CheckIcon } from "@/components/icons";
import { AsaasSignupForm } from "./AsaasSignupForm";

const CENTERED_MAIN_CLASS =
  "mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)] text-center";

// Volta aqui depois de QUALQUER checkout (Mercado Pago legado via
// ?preapproval_id, ou Asaas via ?purchase). Nunca decide sozinha se o
// pagamento foi aprovado — só lê o estado que já está (ou ainda não
// está) no banco, gravado exclusivamente pelos webhooks (item 5 do
// pedido de checkout Asaas: nada aqui libera acesso por conta própria).
export default async function PlanosRetornoPage({
  searchParams,
}: {
  searchParams: Promise<{ preapproval_id?: string; purchase?: string }>;
}) {
  const { preapproval_id: preapprovalId, purchase: purchaseId } = await searchParams;

  if (purchaseId) {
    return <AsaasRetorno purchaseId={purchaseId} />;
  }

  // Fluxo Mercado Pago (etapa anterior, mantido sem alterações).
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/planos/retorno");
  }

  if (preapprovalId) {
    try {
      await syncSubscriptionFromPreapproval(preapprovalId);
    } catch (error) {
      console.error("Falha ao confirmar assinatura no retorno do checkout:", error);
    }
  }

  const subscription = await getCurrentSubscription(user.id);

  return (
    <main className={CENTERED_MAIN_CLASS}>
      {subscription?.status === "active" ? (
        <>
          <h1 className="text-2xl font-bold text-foreground">Assinatura confirmada!</h1>
          <p className="text-muted">Seu acesso ao Pregue Melhor Pro já está liberado.</p>
          <Link
            href="/"
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            Começar a usar
          </Link>
        </>
      ) : subscription?.status === "cancelled" ? (
        <>
          <h1 className="text-2xl font-bold text-foreground">
            Não foi possível concluir a assinatura.
          </h1>
          <p className="text-muted">Você pode tentar novamente quando quiser.</p>
          <Link
            href="/planos"
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            Tentar novamente
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-foreground">
            Estamos confirmando sua assinatura.
          </h1>
          <p className="text-muted">
            Isso costuma levar só alguns segundos. Você pode atualizar esta página para
            conferir.
          </p>
          <Link
            href="/planos/retorno"
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            Atualizar status
          </Link>
        </>
      )}

      <Link href="/" className="text-sm font-medium text-muted underline underline-offset-4">
        Voltar para o início
      </Link>
    </main>
  );
}

async function AsaasRetorno({ purchaseId }: { purchaseId: string }) {
  const status = await getPurchaseStatus(purchaseId);

  if (!status) {
    return (
      <main className={CENTERED_MAIN_CLASS}>
        <h1 className="text-2xl font-bold text-foreground">Não encontramos esse pagamento</h1>
        <p className="text-muted">Verifique o link ou tente novamente.</p>
        <Link
          href="/planos/pagar"
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
        >
          Tentar novamente
        </Link>
      </main>
    );
  }

  if (status.status === "pending") {
    return (
      <main className={CENTERED_MAIN_CLASS}>
        <h1 className="text-2xl font-bold text-foreground">Estamos confirmando seu pagamento</h1>
        <p className="text-muted">
          Isso costuma levar só alguns segundos. Você pode atualizar esta página para conferir.
        </p>
        <Link
          href={`/planos/retorno?purchase=${purchaseId}`}
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
        >
          Atualizar status
        </Link>
        <Link href="/" className="text-sm font-medium text-muted underline underline-offset-4">
          Voltar para o início
        </Link>
      </main>
    );
  }

  if (status.status !== "paid") {
    return (
      <main className={CENTERED_MAIN_CLASS}>
        <h1 className="text-2xl font-bold text-foreground">
          Não foi possível concluir o pagamento
        </h1>
        <Link
          href="/planos/pagar"
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
        >
          Tentar novamente
        </Link>
      </main>
    );
  }

  // status.status === "paid" a partir daqui. Chama claimPendingPurchase
  // sempre que já há alguém logado — mesmo quando status.claimedByCurrentUser
  // já é true (a compra já tem dono), porque "ter dono" e "assinatura
  // realmente ativada" são coisas diferentes: se a ativação falhou uma
  // vez, claimPendingPurchase detecta e tenta de novo (ver purchase.ts).
  // Nunca decide "sucesso" só de olhar claimed_by_user_id.
  const user = await getCurrentUser();
  if (user) {
    // Já logado (item 14: não pede cadastro de novo) — reivindica/repara
    // na hora, sem precisar de nenhuma ação extra da pessoa.
    const claim = await claimPendingPurchase(purchaseId);
    if (claim.success) {
      return (
        <main className={CENTERED_MAIN_CLASS}>
          <h1 className="text-2xl font-bold text-foreground">Assinatura confirmada!</h1>
          <p className="text-muted">Seu acesso ao Pregue Melhor Pro já está liberado.</p>
          <Link
            href="/"
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            Começar a usar
          </Link>
        </main>
      );
    }
    return (
      <main className={CENTERED_MAIN_CLASS}>
        <h1 className="text-2xl font-bold text-foreground">Não foi possível vincular o pagamento</h1>
        <p className="text-muted">{claim.message}</p>
        <Link href="/" className="text-sm font-medium text-muted underline underline-offset-4">
          Voltar para o início
        </Link>
      </main>
    );
  }

  // Pagamento confirmado, sem conta — cadastro (item 12 do pedido).
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <AuthLogo />

      <header className="flex flex-col items-center gap-1 text-center">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckIcon className="h-4 w-4" />
          Pagamento confirmado
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Agora crie seu acesso</h1>
      </header>

      <AsaasSignupForm purchaseId={purchaseId} />

      <Link
        href={`/entrar?redirectTo=${encodeURIComponent(`/planos/retorno?purchase=${purchaseId}`)}`}
        className="text-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Já tenho uma conta → Entrar
      </Link>
    </main>
  );
}
