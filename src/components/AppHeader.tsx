import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";

type AppHeaderProps = {
  // Presente = mostra a seta de voltar (mesmo destino que o BackLink
  // usava antes nesta página). Ausente = página "de topo" (Conta,
  // Biblioteca, Academia) — a bottom nav já cobre "voltar pro Início".
  backHref?: string;
};

// Barra escura reutilizável nas páginas internas — mesma identidade da
// Home (logo + "Pregue Melhor", cor --header-bg), pra dar continuidade
// visual ao sair da Home (escura) pras ferramentas (claras). Nunca
// usado na própria Home, que tem seu cabeçalho próprio.
export function AppHeader({ backHref }: AppHeaderProps) {
  return (
    <header className="bg-header">
      <div className="mx-auto flex w-full max-w-xl items-center gap-2 px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Voltar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
        )}
        <Image
          src="/brand/icon-source.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
        <span className="text-sm font-bold tracking-tight text-white">Pregue Melhor</span>
      </div>
    </header>
  );
}
