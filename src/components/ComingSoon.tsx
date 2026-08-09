import Link from "next/link";

type ComingSoonProps = {
  title: string;
};

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="text-muted">Ferramenta em desenvolvimento.</p>
      <Link
        href="/"
        className="mt-4 text-sm font-medium text-primary underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
