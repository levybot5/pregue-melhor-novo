"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { SpinnerIcon } from "@/components/icons";
import { EBOOK_LABEL, EBOOK_PRICE } from "@/services/billing/pricing";
import { createEbookPurchaseAction, getEbookPurchaseStatusAction } from "@/app/academia/actions";

type Step = "idle" | "form" | "qr";

const POLL_INTERVAL_MS = 4000;
const STORAGE_KEY = "pregue-melhor-pending-ebook-pix";

type StoredPurchase = { purchaseId: string; qrCodeBase64: string; copyPaste: string };

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

// Compra avulsa do ebook de dentro da Academia — sempre logado (a
// página já garante sessão antes de renderizar isto), então a compra
// já nasce vinculada à conta: nada de claim/needsAccount, diferente do
// checkout de plano. Ao confirmar, router.refresh() re-renderiza a
// página (Server Component) e o link do PDF aparece desbloqueado,
// sem precisar de uma tela de retorno separada.
export function EbookPurchaseCard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingPix, startCreatingPix] = useTransition();

  const [name, setName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");

  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copiar código Pix");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const stored = readStoredPurchase();
    if (stored) {
      /* eslint-disable react-hooks/set-state-in-effect -- restauração
         única na montagem, a partir do sessionStorage */
      setPurchaseId(stored.purchaseId);
      setQrCodeBase64(stored.qrCodeBase64);
      setCopyPaste(stored.copyPaste);
      setStep("qr");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  const checkStatus = useCallback(async () => {
    if (!purchaseId) return false;
    const status = await getEbookPurchaseStatusAction(purchaseId);
    if (!status) return false;
    if (status.status === "paid") {
      setPaid(true);
      clearStoredPurchase();
      router.refresh();
      return true;
    }
    return false;
  }, [purchaseId, router]);

  useEffect(() => {
    if (step !== "qr" || !purchaseId || paid) return;
    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);
    function handleVisibility() {
      if (document.visibilityState === "visible") checkStatus();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [step, purchaseId, paid, checkStatus]);

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
      const result = await createEbookPurchaseAction({ name: name.trim(), cpfCnpj });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
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
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-card-border bg-card p-4 text-center shadow-sm">
        <p className="text-sm font-semibold text-foreground">Abra o app do seu banco e escaneie:</p>
        <img
          src={`data:image/png;base64,${qrCodeBase64}`}
          alt="QR Code Pix"
          className="h-48 w-48 rounded-2xl border border-card-border bg-card p-2"
        />
        <div className="flex w-full flex-col gap-2">
          <div className="rounded-2xl border border-card-border bg-background px-4 py-3 text-left text-xs break-all text-muted">
            {copyPaste}
          </div>
          <button
            type="button"
            onClick={handleCopyPix}
            className="flex min-h-[44px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
          >
            {copyLabel}
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-muted">
          <SpinnerIcon className="h-4 w-4 shrink-0 animate-spin text-primary" />
          O PDF libera aqui mesmo assim que o pagamento confirmar.
        </div>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Nome completo</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="min-h-[48px] rounded-2xl border border-card-border bg-background px-4 text-base text-foreground outline-none focus:border-primary"
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
            className="min-h-[48px] rounded-2xl border border-card-border bg-background px-4 text-base text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          onClick={handleGeneratePix}
          disabled={isCreatingPix}
          className="flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isCreatingPix ? "Gerando cobrança..." : "Gerar Pix"}
        </button>
        {errorMessage && (
          <p role="status" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStep("form")}
      className="flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
    >
      Adquirir o {EBOOK_LABEL} — R${EBOOK_PRICE.toFixed(2).replace(".", ",")}
    </button>
  );
}
