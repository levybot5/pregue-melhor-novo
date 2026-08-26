import { SpinnerIcon } from "@/components/icons";

// Fallback automático do Next.js (convenção de arquivo) — mostrado
// via Suspense assim que o usuário clica num link, enquanto a página
// de destino ainda está buscando dados no servidor (auth, assinatura
// etc.). Sem isso a tela ficava "parada" por 1-2s até a navegação
// terminar. Cobre TODAS as rotas (não existe loading.tsx mais
// específico em nenhuma subpasta), sem precisar tocar em nenhuma
// página existente.
export default function Loading() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-background">
      <SpinnerIcon className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
    </main>
  );
}
