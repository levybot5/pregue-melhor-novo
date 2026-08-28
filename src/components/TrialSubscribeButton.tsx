import Link from "next/link";

type TrialSubscribeButtonProps = {
  className?: string;
};

// CTA visível durante todo o trial (topo das 6 ferramentas elegíveis
// + Home) — nunca interrompe o usuário, só um link para a oferta.
export function TrialSubscribeButton({ className }: TrialSubscribeButtonProps) {
  return (
    <Link
      href="/planos"
      className={
        className ??
        "shrink-0 animate-[subscribe-pulse_1.8s_ease-in-out_infinite] whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary-foreground"
      }
    >
      Assinar Pregue Melhor
    </Link>
  );
}
