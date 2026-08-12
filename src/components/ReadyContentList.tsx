"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Testament } from "@/services/database";

export type ReadyContentCardItem = {
  id: string;
  slug: string;
  title: string;
  baseText: string;
  categoryId: string;
  testament: Testament;
  shortDescription: string;
};

type ReadyContentListProps = {
  basePath: string;
  items: ReadyContentCardItem[];
  categories: { id: string; label: string }[];
  favoritedIds: string[];
};

const TESTAMENT_LABELS: Record<"AT" | "NT", string> = {
  AT: "Antigo Testamento",
  NT: "Novo Testamento",
};

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap ${
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-card-border bg-card text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// Busca, filtros e favoritos rodam inteiramente no cliente sobre a
// lista leve já carregada — 0 requisições novas por tecla, 0 IA.
export function ReadyContentList({
  basePath,
  items,
  categories,
  favoritedIds,
}: ReadyContentListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [testament, setTestament] = useState<"AT" | "NT" | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);
  const categoryLabels = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat.label])),
    [categories],
  );

  const presentCategoryIds = useMemo(
    () => new Set(items.map((item) => item.categoryId)),
    [items],
  );
  const availableCategories = categories.filter((cat) => presentCategoryIds.has(cat.id));

  const hasBothTestaments =
    items.some((item) => item.testament === "AT") && items.some((item) => item.testament === "NT");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return items.filter((item) => {
      if (favoritesOnly && !favoritedSet.has(item.id)) return false;
      if (category && item.categoryId !== category) return false;
      if (testament && item.testament !== testament) return false;

      if (normalizedQuery) {
        const categoryLabel = categoryLabels.get(item.categoryId) ?? "";
        const haystack = `${item.title} ${item.baseText} ${categoryLabel}`.toLocaleLowerCase(
          "pt-BR",
        );
        if (!haystack.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [items, query, category, testament, favoritesOnly, favoritedSet, categoryLabels]);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por tema, passagem ou palavra..."
        className="min-h-[48px] w-full rounded-2xl border border-card-border bg-card px-4 text-base text-foreground placeholder:text-muted"
      />

      <ChipRow>
        <Chip active={favoritesOnly} onClick={() => setFavoritesOnly((current) => !current)}>
          ★ Favoritos
        </Chip>
        <Chip active={category === null} onClick={() => setCategory(null)}>
          Todos
        </Chip>
        {availableCategories.map((cat) => (
          <Chip key={cat.id} active={category === cat.id} onClick={() => setCategory(cat.id)}>
            {cat.label}
          </Chip>
        ))}
      </ChipRow>

      {hasBothTestaments && (
        <ChipRow>
          <Chip active={testament === null} onClick={() => setTestament(null)}>
            Todos os testamentos
          </Chip>
          <Chip active={testament === "AT"} onClick={() => setTestament("AT")}>
            {TESTAMENT_LABELS.AT}
          </Chip>
          <Chip active={testament === "NT"} onClick={() => setTestament("NT")}>
            {TESTAMENT_LABELS.NT}
          </Chip>
        </ChipRow>
      )}

      {filtered.length === 0 && (
        <p className="text-muted">Nenhum resultado encontrado.</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`${basePath}/${item.slug}`}
            className="flex flex-col gap-1 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-base font-semibold text-foreground">{item.title}</span>
              {favoritedSet.has(item.id) && <span className="shrink-0 text-primary">★</span>}
            </div>
            <span className="text-sm text-muted">
              {item.baseText} · {categoryLabels.get(item.categoryId) ?? item.categoryId}
            </span>
            <span className="text-sm text-foreground">{item.shortDescription}</span>
            <span className="mt-1 self-end text-xs font-semibold text-primary">Abrir →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
