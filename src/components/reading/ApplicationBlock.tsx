type ApplicationBlockProps = {
  title: string;
  children: React.ReactNode;
};

// Um dos poucos lugares em que um bloco visual maior faz sentido —
// fundo suave, sem sombra pesada, para destacar a aplicação prática.
export function ApplicationBlock({ title, children }: ApplicationBlockProps) {
  return (
    <section className="flex flex-col gap-1.5 rounded-2xl bg-primary-soft px-4 py-4">
      <h2 className="text-xs font-semibold tracking-wide text-primary uppercase">{title}</h2>
      <div className="text-[17px] leading-[1.75] text-foreground">{children}</div>
    </section>
  );
}
