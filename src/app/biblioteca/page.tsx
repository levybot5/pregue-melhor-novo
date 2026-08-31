import Link from "next/link";
import { redirect } from "next/navigation";
import { listContents } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/home/BottomNav";
import { BibliotecaListItem } from "./BibliotecaListItem";

// Sempre busca no request: a biblioteca não pode ficar "congelada"
// com os dados que existiam no momento do build.
export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  // O proxy já bloqueia esta rota sem sessão; reverificamos aqui porque
  // a página é seu próprio ponto de entrada e não deve depender só dele.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/biblioteca");
  }

  let contents: Awaited<ReturnType<typeof listContents>> = [];
  let loadError = false;

  try {
    contents = await listContents();
  } catch (error) {
    console.error("Falha ao carregar a biblioteca:", error);
    loadError = true;
  }

  return (
    <>
      <AppHeader backHref="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-10">
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
          <BibliotecaListItem key={item.id} item={item} />
        ))}
      </div>

      <Link
        href="/"
        className="text-sm font-medium text-muted underline underline-offset-4"
      >
        Voltar para o início
      </Link>
      </main>
      <BottomNav />
    </>
  );
}
