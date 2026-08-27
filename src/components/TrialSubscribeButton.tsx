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
      href="/planos"
      className={
        className ??
        "shrink-0 animate-[subscribe-pulse_1.8s_ease-in-out_infinite] whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-primary-foreground"
      }
    >
      Assinar Pregue Melhor
    </Link>
  );
}
