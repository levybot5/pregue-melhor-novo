"use client";

import { useState, useTransition } from "react";
import { CheckIcon } from "@/components/icons";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { PLANS, KIT_PRICE, KIT_LABEL, type PlanId } from "@/services/billing/pricing";
import { createHostedCheckoutAction } from "./actions";

// _fbc/_fbp são gravados pelo pixel do Facebook (ver
// components/MetaPixel.tsx) — lidos aqui só na hora de abrir o
// checkout e mandados junto pra guardar na compra, pra Conversions
// API usar depois quando o pagamento confirmar (ver
// services/marketing/meta-capi.ts).
function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// InitiateCheckout só existe no navegador (evento padrão da Meta, sem
// duplicar via Conversions API) — a pessoa ainda está no nosso site
// nesse momento, então o pixel sozinho já é confiável. Dá à Meta um
// sinal de funil antes da compra confirmar, útil mesmo quando o _fbc
// se perde depois (Safari/iOS derruba esse cookie rápido).
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
function trackInitiateCheckout(value: number, planId: PlanId) {
  window.fbq?.("track", "InitiateCheckout", {
    value,
    currency: "BRL",
    content_ids: [planId],
    content_type: "product",
  });
}

// Checkout hospedado da Asaas: a pessoa sai daqui direto pra página
// deles (Pix ou Cartão, ela escolhe lá), sem precisar de conta antes
// — o pagamento nasce vinculado ao dispositivo e a conta é criada ou
// vinculada em /planos/retorno depois que confirmar (mesmo padrão que
// o Pix direto já usava, ver services/billing/purchase.ts).
export function PagarForm({ planId }: { planId: PlanId }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [includeKit, setIncludeKit] = useState(false);
  const [isRedirecting, startRedirecting] = useTransition();

  const plan = PLANS[planId];
  const total = Math.round((plan.price + (includeKit ? KIT_PRICE : 0)) * 100) / 100;

  function handleContinue() {
    setErrorMessage(null);
    startRedirecting(async () => {
      const result = await createHostedCheckoutAction({
        planId,
        includeKit,
        fbc: readCookie("_fbc"),
        fbp: readCookie("_fbp"),
      });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      trackInitiateCheckout(total, planId);
      window.location.href = result.checkoutUrl;
    });
  }

  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pregue Melhor Pro</h1>
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Plano {plan.label}
        </span>
        <p className="text-3xl font-bold text-foreground">
          R${plan.price.toFixed(2).replace(".", ",")}
          <span className="text-base font-medium text-muted"> / {plan.days} dias</span>
        </p>
        <p className="text-muted">Pagamento único via Pix ou cartão — {plan.days} dias de acesso.</p>
      </header>

      <label className="flex items-start gap-3 rounded-2xl border border-card-border bg-card p-4">
        <input
          type="checkbox"
          checked={includeKit}
          onChange={(e) => setIncludeKit(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-primary"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Adicionar {KIT_LABEL} — +R${KIT_PRICE.toFixed(2).replace(".", ",")}
          </span>
          <span className="text-xs text-muted">
            Tenha um apoio prático para se preparar melhor e pregar com mais segurança, mesmo
            quando bater o nervosismo.
          </span>
        </span>
      </label>

      <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 text-sm">
        <span className="text-muted">Total</span>
        <span className="text-lg font-bold text-foreground">
          R${total.toFixed(2).replace(".", ",")}
        </span>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={isRedirecting}
        className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
      >
        {isRedirecting ? "Abrindo pagamento..." : "Continuar para pagamento"}
      </button>

      {errorMessage && (
        <p role="status" className="text-red-600">
          {errorMessage}
        </p>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted">
        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
        Cancele quando quiser.
      </p>
      </main>
      <BottomNav />
    </>
  );
}
