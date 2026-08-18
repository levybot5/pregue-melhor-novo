"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CheckIcon, SpinnerIcon } from "@/components/icons";
import { createPixPurchaseAction, getPurchaseStatusAction } from "./actions";

// Só Pix neste lançamento (cartão fica pronto no backend, mas sem
// botão nenhum na UI — decisão de produto, sem necessidade de reativar
// o checkout hospedado de cartão agora).
type Step = "form" | "qr";

const POLL_INTERVAL_MS = 4000;

function formatCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function PagarForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingPix, startCreatingPix] = useTransition();

  const [name, setName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");

  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copiar código Pix");
  const [paid, setPaid] = useState(false);

  // Fica esperando a confirmação chegar pelo webhook — nunca decide
  // sozinho que o pagamento aconteceu (nem por "voltei da tela", nem
  // por ?success=true). Só o servidor, consultando o estado real da
  // compra, pode dizer que está pago (item 5 do pedido).
  useEffect(() => {
    if (step !== "qr" || !purchaseId || paid) return;

    const interval = setInterval(async () => {
      const status = await getPurchaseStatusAction(purchaseId);
      if (!status) return;
      if (status.status === "paid") {
        setPaid(true);
        if (status.needsAccount) {
          router.push(`/planos/retorno?purchase=${purchaseId}`);
        } else {
          router.push("/planos/retorno");
        }
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [step, purchaseId, paid, router]);

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
      });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setPurchaseId(result.purchaseId);
      setQrCodeBase64(result.qrCodeBase64);
      setCopyPaste(result.copyPaste);
      setStep("qr");
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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-5 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)] text-center">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Escaneie o QR Code
          </h1>
          <p className="text-muted">Pague com o app do seu banco para liberar o acesso.</p>
        </header>

        <img
          src={`data:image/png;base64,${qrCodeBase64}`}
          alt="QR Code Pix"
          className="h-56 w-56 rounded-2xl border border-card-border bg-card p-2"
        />

        <div className="flex w-full flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">Pix Copia e Cola</p>
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

        <Link href="/" className="text-sm font-medium text-muted underline underline-offset-4">
          Voltar para o início
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pregue Melhor Pro</h1>
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Valor de lançamento
        </span>
        <p className="text-3xl font-bold text-foreground">
          R$10<span className="text-base font-medium text-muted">/mês</span>
        </p>
        <p className="text-muted">Pagamento único via Pix — 30 dias de acesso.</p>
      </header>

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

      <Link href="/" className="text-sm font-medium text-muted underline underline-offset-4">
        Voltar para o início
      </Link>
    </main>
  );
}
