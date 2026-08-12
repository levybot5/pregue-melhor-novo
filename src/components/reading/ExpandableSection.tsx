"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

type ExpandableSectionProps = {
  title: string;
  children: React.ReactNode;
};

// Aprofundamento opcional (Contexto Bíblico, Palavra no Original,
// etc.) — fechado por padrão, sem persistir estado após refresh.
// Visual discreto: link com detalhe dourado, não um botão gigante.
export function ExpandableSection({ title, children }: ExpandableSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-card-border pt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-h-[40px] w-full items-center justify-between gap-2 text-left text-sm font-semibold text-primary"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-accent">▸</span>
          {title}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-2 rounded-xl bg-card-active px-3 py-3 text-[16px] leading-[1.7] text-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
