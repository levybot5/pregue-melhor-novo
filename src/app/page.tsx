import Link from "next/link";
import { ToolCard } from "@/components/ToolCard";
import {
  ListIcon,
  LibraryIcon,
  MessageIcon,
  OpenBookIcon,
  TransformIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/services/auth";
import { signOutAction } from "./actions";

const tools = [
  {
    href: "/pregacao",
    title: "Pregação Completa",
    description: "Crie uma mensagem estruturada do início ao fim.",
    icon: <MessageIcon className="h-6 w-6" />,
  },
  {
    href: "/esboco-pulpito",
    title: "Esboço para Púlpito",
    description: "Tenha os principais pontos da mensagem sempre à mão.",
    icon: <ListIcon className="h-6 w-6" />,
  },
  {
    href: "/esboco-pregacao",
    title: "Esboço em Pregação",
    description: "Transforme suas ideias em uma mensagem estruturada.",
    icon: <TransformIcon className="h-6 w-6" />,
  },
  {
    href: "/biblia",
    title: "Bíblia Explicada",
    description: "Entenda uma passagem bíblica com clareza.",
    icon: <OpenBookIcon className="h-6 w-6" />,
  },
  {
    href: "/biblioteca",
    title: "Minha Biblioteca",
    description: "Encontre suas mensagens e estudos salvos.",
    icon: <LibraryIcon className="h-6 w-6" />,
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pregue Melhor
        </h1>
        <p className="text-muted">Prepare sua mensagem com mais clareza.</p>
      </header>

      <div className="flex items-center justify-between text-sm">
        {user ? (
          <>
            <span className="text-muted">{user.email}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="font-medium text-primary underline underline-offset-4"
              >
                Sair
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/entrar"
            className="font-medium text-primary underline underline-offset-4"
          >
            Entrar
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </main>
  );
}
