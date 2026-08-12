type ReadingSectionProps = {
  title: string;
  children: React.ReactNode;
  emphasis?: boolean;
};

// Bloco editorial simples: título + texto com respiro, sem card
// pesado. Usado em Introdução, Conclusão, Apelo, Oração — texto
// corrido, não uma lista de caixas.
export function ReadingSection({ title, children, emphasis }: ReadingSectionProps) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2
        className={`text-xs font-semibold tracking-wide uppercase ${
          emphasis ? "text-accent" : "text-primary"
        }`}
      >
        {title}
      </h2>
      <div className="text-[17px] leading-[1.75] text-foreground">{children}</div>
    </section>
  );
}
