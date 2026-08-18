import Link from "next/link";

type TrialSubscribeButtonProps = {
  className?: string;
};

// CTA discreto, fica visível durante todo o trial (topo das 6
// ferramentas elegíveis) — nunca interrompe o usuário, só um link para
// a oferta. Não usar min-h-[44px]/[52px] dos botões principais de
// propósito: precisa ficar pequeno para não competir com "Gerar".
export function TrialSubscribeButton({ className }: TrialSubscribeButtonProps) {
  return (
    <Link
      href="/planos/pagar"
      className={
        className ??
        "shrink-0 whitespace-nowrap rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent"
      }
    >
      Assinar Pro
    </Link>
  );
}
