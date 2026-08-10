type GenerationCounterProps = {
  remaining: number;
  className?: string;
};

export function GenerationCounter({ remaining, className }: GenerationCounterProps) {
  const label =
    remaining === 1 ? "1 geração disponível hoje" : `${remaining} gerações disponíveis hoje`;

  return <p className={className ?? "text-xs text-muted"}>{label}</p>;
}
