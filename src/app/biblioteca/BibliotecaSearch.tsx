"use client";

import { useMemo, useState } from "react";
import type { Content } from "@/services/database";
import { getContentTypeLabel } from "@/lib/content-types";
import { SearchIcon } from "@/components/icons";
import { BibliotecaListItem } from "./BibliotecaListItem";

// Busca só no que já foi carregado (título, tema/passagem base e tipo)
// — nada de ida ao banco a cada letra digitada. Biblioteca pessoal
// costuma ter dezenas de itens, não milhares, então filtrar no cliente
// é instantâneo e mais simples do que uma Server Action por tecla.
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function BibliotecaSearch({ contents }: { contents: Content[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = normalize(query.trim());
    if (!normalized) return contents;
    return contents.filter((item) => {
      const haystack = normalize(
        `${item.title} ${item.base_text ?? ""} ${getContentTypeLabel(item.type)}`,
      );
      return haystack.includes(normalized);
    });
  }, [contents, query]);

  return (
    <>
      {contents.length > 0 && (
        <label className="relative flex items-center">
          <SearchIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, tema ou passagem..."
            className="min-h-[44px] w-full rounded-xl border border-card-border bg-card py-2 pl-10 pr-3.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
      )}

      {query.trim() && filtered.length === 0 ? (
        <p className="text-muted">
          Nenhum resultado para &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <BibliotecaListItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
