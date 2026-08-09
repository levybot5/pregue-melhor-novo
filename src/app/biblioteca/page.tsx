import Link from "next/link";
import { listContents } from "@/services/database";

// Sempre busca no request: a biblioteca não pode ficar "congelada"
// com os dados que existiam no momento do build.
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function BibliotecaPage() {
  let contents: Awaited<ReturnType<typeof listContents>> = [];
  let loadError = false;

  try {
    contents = await listContents();
  } catch (error) {
    console.error("Falha ao carregar a biblioteca:", error);
    loadError = true;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Minha Biblioteca
        </h1>
        <p className="text-muted">Encontre suas mensagens e estudos salvos.</p>
      </header>

      {loadError && (
        <p className="text-red-600">
          Não foi possível carregar sua biblioteca agora.
        </p>
      )}

      {!loadError && contents.length === 0 && (
        <p className="text-muted">Nenhum conteúdo salvo ainda.</p>
      )}

      <div className="flex flex-col gap-3">
        {contents.map((item) => (
          <Link
            key={item.id}
            href={`/biblioteca/${item.id}`}
            className="flex flex-col gap-1 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
          >
            <span className="text-base font-semibold text-foreground">
              {item.title}
            </span>
            <span className="text-sm text-muted">
              {item.type}
              {item.base_text ? ` · ${item.base_text}` : ""}
            </span>
            <span className="text-xs text-muted">
              {formatDate(item.created_at)}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
