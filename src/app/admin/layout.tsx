import Link from "next/link";
import { requireAdmin } from "@/services/admin";

// requireAdmin() roda UMA vez aqui pro layout inteiro — cada page.tsx
// abaixo não precisa repetir a checagem. Sem sessão: redirect pro
// login. Com sessão mas sem ser admin: 404 (nunca revela que /admin
// existe). Cada RPC também confere admin por dentro, então mesmo que
// esse gate falhasse, os dados continuam protegidos.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Painel Admin</h1>
        <nav className="flex gap-4 text-sm font-semibold">
          <Link href="/admin" className="text-primary underline underline-offset-4">
            Visão geral
          </Link>
          <Link href="/admin/assinantes" className="text-primary underline underline-offset-4">
            Assinantes
          </Link>
          <Link href="/" className="text-muted underline underline-offset-4">
            Voltar ao app
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
