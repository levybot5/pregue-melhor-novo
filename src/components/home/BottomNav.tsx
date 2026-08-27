"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, LibraryIcon, GraduationCapIcon, UserIcon } from "@/components/icons";

// Só rotas que já existem no app — nenhuma nova. Fixa, só no mobile
// (lg:hidden) — no desktop a Home não vira "app mobile gigante".
const NAV_ITEMS = [
  { href: "/", label: "Início", icon: HomeIcon },
  { href: "/biblioteca", label: "Biblioteca", icon: LibraryIcon },
  { href: "/academia", label: "Academia", icon: GraduationCapIcon },
  { href: "/conta", label: "Conta", icon: UserIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-header pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-xl items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                active ? "text-accent" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
