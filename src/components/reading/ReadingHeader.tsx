import Link from "next/link";
import { ChevronLeftIcon, StarIcon } from "@/components/icons";

type BackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

// "Voltar" fica no topo, acima do título — não no rodapé da página.
// className extra é só pra sobrescrever alinhamento (ex.: self-start
// dentro de um <main> centralizado) — nunca pra mudar a aparência base.
export function BackLink({ href, label = "Voltar", className = "" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[36px] w-fit items-center gap-1 text-sm font-medium text-muted ${className}`}
    >
      <ChevronLeftIcon className="h-4 w-4" />
      {label}
    </Link>
  );
}

type ReadingHeaderProps = {
  title: string;
  baseText?: string | null;
  categoryLabel?: string | null;
  favorited?: boolean;
};

// Cabeçalho compacto: título em destaque, uma linha de metadados
// discreta abaixo. Nada de bloco gigante — o conteúdo começa rápido.
export function ReadingHeader({ title, baseText, categoryLabel, favorited }: ReadingHeaderProps) {
  const meta = [baseText, categoryLabel].filter(Boolean).join(" · ");

  return (
    <header className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {favorited && (
          <span className="mt-1 flex shrink-0 items-center gap-1 text-xs font-medium text-accent">
            <StarIcon className="h-4 w-4 fill-accent text-accent" />
            Favorito
          </span>
        )}
      </div>
      {meta && <p className="text-sm text-muted">{meta}</p>}
    </header>
  );
}
