type PointBlockProps = {
  index: number;
  title: string;
  children: React.ReactNode;
  last?: boolean;
};

// Ponto numerado: número dourado, título azul-marinho, texto escuro,
// divisória discreta entre pontos — nunca um card grande por ponto.
export function PointBlock({ index, title, children, last }: PointBlockProps) {
  return (
    <div className={last ? "" : "border-b border-card-border pb-5"}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg font-bold text-accent tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="text-base font-bold tracking-tight text-primary uppercase">{title}</h3>
          <div className="text-[16px] leading-[1.7] text-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
