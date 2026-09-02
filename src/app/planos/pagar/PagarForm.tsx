"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { CheckIcon, SpinnerIcon } from "@/components/icons";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { PLANS, KIT_PRICE, KIT_LABEL, type PlanId } from "@/services/billing/pricing";
import { createPixPurchaseAction, getPurchaseStatusAction } from "./actions";

// Voltou a ser Pix direto (nome+CPF só) em vez do checkout hospedado
// da Asaas — testado ao vivo e a página deles pede e-mail, celular e
// endereço além de nome/CPF, mais fricção do que o formulário próprio,
// não menos. O checkout hospedado (createHostedCheckoutAction) continua
// pronto no backend pra reativar se fizer sentido depois. O que ficou
// do checkout hospedado: /planos e /planos/pagar continuam PÚBLICOS
// (proxy.ts) — não exige cadastro antes de pagar, só o formulário
// voltou a ser o simples.
type Step = "form" | "qr";

const POLL_INTERVAL_MS = 4000;

// _fbc/_fbp são gravados pelo pixel do Facebook (ver
// components/MetaPixel.tsx) — lidos aqui só na hora de gerar o PIX e
// mandados junto pra guardar na compra, pra Conversions API usar
// depois quando o pagamento confirmar (ver services/marketing/meta-capi.ts).
function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// InitiateCheckout só existe no navegador (evento padrão da Meta, sem
// duplicar via Conversions API) — ao contrário do Purchase, a pessoa
// ainda está no site nesse momento, então o pixel sozinho já é
// confiável. Dá à Meta um sinal de funil antes da compra confirmar,
// útil mesmo quando o _fbc se perde depois (Safari/iOS derruba esse
// cookie rápido — foi isso que fez uma venda real não aparecer
// atribuída no Gerenciador de Anúncios).
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

// Sobrevive a uma recarga da página: no Android é comum o navegador
// ser encerrado pelo sistema (memória) quando o usuário sai pra pagar
// no app do banco — sem isso, ao voltar o React perde o purchaseId e o
// QR Code, e a tela reinicia do zero em vez de continuar aguardando
// (ou pular direto pro pós-pagamento, se já tiver sido pago).
const STORAGE_KEY = "pregue-melhor-pending-pix";

type StoredPurchase = {
  purchaseId: string;
  qrCodeBase64: string;
  copyPaste: string;
};

function readStoredPurchase(): StoredPurchase | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPurchase) : null;
  } catch {
    return null;
  }
}

function writeStoredPurchase(value: StoredPurchase) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // sessionStorage indisponível (modo privado etc.) — só perde a
    // recuperação após reload, o fluxo normal continua funcionando.
  }
}

function clearStoredPurchase() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ver comentário em writeStoredPurchase.
  }
}

function formatCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function PagarForm({ planId }: { planId: PlanId }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingPix, startCreatingPix] = useTransition();

  const [name, setName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [includeKit, setIncludeKit] = useState(false);

  const plan = PLANS[planId];
  const total = Math.round((plan.price + (includeKit ? KIT_PRICE : 0)) * 100) / 100;

  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copiar código Pix");
  const [paid, setPaid] = useState(false);
  const [isCheckingManually, startCheckingManually] = useTransition();
  const [manualCheckMessage, setManualCheckMessage] = useState<string | null>(null);

  // Restaura a compra pendente se a página recarregou (usuário saiu
  // pra pagar no app do banco e voltou) — sem isso a tela reiniciava
  // do zero em vez de continuar aguardando o pagamento. Só existe no
  // client (sessionStorage), por isso não dá pra ler no render inicial
  // (SSR não tem acesso) — precisa ser um efeito de montagem mesmo.
  useEffect(() => {
    const stored = readStoredPurchase();
    if (stored) {
      /* eslint-disable react-hooks/set-state-in-effect -- restauração
         única na montagem, a partir do sessionStorage (não existe no
         SSR pra virar estado inicial via useState) */
      setPurchaseId(stored.purchaseId);
      setQrCodeBase64(stored.qrCodeBase64);
      setCopyPaste(stored.copyPaste);
      setStep("qr");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  // Fica esperando a confirmação chegar pelo webhook — nunca decide
  // sozinho que o pagamento aconteceu (nem por "voltei da tela", nem
  // por ?success=true). Só o servidor, consultando o estado real da
  // compra, pode dizer que está pago (item 5 do pedido). Compartilhada
  // entre o polling automático e o botão "Já paguei" (checagem manual).
  const checkStatus = useCallback(async () => {
    if (!purchaseId) return false;
    const status = await getPurchaseStatusAction(purchaseId);
    if (!status) return false;
    if (status.status === "paid") {
      setPaid(true);
      clearStoredPurchase();
      if (status.needsAccount) {
        router.push(`/planos/retorno?purchase=${purchaseId}`);
      } else {
        router.push("/planos/retorno");
      }
      return true;
    }
    return false;
  }, [purchaseId, router]);

  useEffect(() => {
    if (step !== "qr" || !purchaseId || paid) return;

    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);

    // Timers em segundo plano são pausados/limitados pelo navegador —
    // ao voltar a aba pra frente (ex.: depois de pagar no app do
    // banco), checa na hora em vez de esperar o próximo tick do
    // interval, que pode demorar ou nunca ter rodado enquanto oculta.
    function handleVisibility() {
      if (document.visibilityState === "visible") checkStatus();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [step, purchaseId, paid, checkStatus]);

  function handleManualCheck() {
    setManualCheckMessage(null);
    startCheckingManually(async () => {
      const wasPaid = await checkStatus();
      if (!wasPaid) {
        setManualCheckMessage(
          "Ainda não identificamos o pagamento. Se você já pagou, aguarde alguns segundos e tente de novo.",
        );
      }
    });
  }

  function handleGeneratePix() {
    setErrorMessage(null);
    if (name.trim().length < 3) {
      setErrorMessage("Digite seu nome completo.");
      return;
    }
    if (cpfCnpj.length !== 11) {
      setErrorMessage("Digite um CPF válido (11 dígitos).");
      return;
    }
    startCreatingPix(async () => {
      const result = await createPixPurchaseAction({
        name: name.trim(),
        cpfCnpj,
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
      setPurchaseId(result.purchaseId);
      setQrCodeBase64(result.qrCodeBase64);
      setCopyPaste(result.copyPaste);
      setStep("qr");
      writeStoredPurchase({
        purchaseId: result.purchaseId,
        qrCodeBase64: result.qrCodeBase64,
        copyPaste: result.copyPaste,
      });
    });
  }

  async function handleCopyPix() {
    if (!copyPaste) return;
    try {
      await navigator.clipboard.writeText(copyPaste);
      setCopyLabel("Copiado!");
    } catch {
      setCopyLabel("Erro ao copiar");
    } finally {
      setTimeout(() => setCopyLabel("Copiar código Pix"), 2000);
    }
  }

  if (step === "qr" && qrCodeBase64 && copyPaste) {
    return (
      <>
        <AppHeader backHref="/" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-5 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 text-center lg:pb-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pague com Pix
          </h1>
          <p className="text-muted">Abra o app do seu banco e escaneie o QR Code abaixo.</p>
        </header>

        <img
          src={`data:image/png;base64,${qrCodeBase64}`}
          alt="QR Code Pix"
          className="h-56 w-56 rounded-2xl border border-card-border bg-card p-2"
        />

        <div className="flex w-full flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">
            Não consegue escanear? Use o Pix Copia e Cola
          </p>
          <div className="rounded-2xl border border-card-border bg-card px-4 py-3 text-left text-xs break-all text-muted">
            {copyPaste}
          </div>
          <button
            type="button"
            onClick={handleCopyPix}
            className="flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
          >
            {copyLabel}
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-card-border bg-card px-4 py-3 text-sm text-muted">
          <SpinnerIcon className="h-4 w-4 shrink-0 animate-spin text-primary" />
          Assim que o pagamento for confirmado, seu acesso será liberado automaticamente.
        </div>

        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isCheckingManually}
            className="flex min-h-[48px] items-center justify-center rounded-2xl border border-card-border bg-card px-5 font-semibold text-foreground disabled:opacity-60"
          >
            {isCheckingManually ? "Verificando..." : "Já paguei"}
          </button>
          {manualCheckMessage && (
            <p role="status" className="text-sm text-muted">
              {manualCheckMessage}
            </p>
          )}
        </div>
        </main>
        <BottomNav />
      </>
    );
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
        <p className="text-muted">Pagamento único via Pix — {plan.days} dias de acesso.</p>
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

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Nome completo</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome completo"
          className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">CPF</span>
        <input
          type="text"
          inputMode="numeric"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(formatCpf(e.target.value))}
          placeholder="Somente números"
          maxLength={11}
          className="min-h-[52px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
        />
      </label>

      <button
        type="button"
        onClick={handleGeneratePix}
        disabled={isCreatingPix}
        className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
      >
        {isCreatingPix ? "Gerando cobrança..." : "Gerar Pix"}
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
