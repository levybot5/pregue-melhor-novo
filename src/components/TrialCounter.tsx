type TrialCounterProps = {
  remaining: number;
  className?: string;
};

// Contador do trial sem login — "N testes disponíveis" (total do
// dispositivo, não diário). Mesmo padrão discreto de GenerationCounter.
export function TrialCounter({ remaining, className }: TrialCounterProps) {
  const label = remaining === 1 ? "1 teste disponível" : `${remaining} testes disponíveis`;

  return <p className={className ?? "text-xs text-muted"}>{label}</p>;
}
