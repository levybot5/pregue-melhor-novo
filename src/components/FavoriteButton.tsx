"use client";

import { useState, useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions";
import type { FavoriteContentType } from "@/services/database";
import { StarIcon } from "./icons";

type FavoriteButtonProps = {
  contentType: FavoriteContentType;
  contentId: string;
  initialFavorited: boolean;
  className?: string;
};

// Otimista: alterna na hora e só desfaz se o servidor recusar (ex.:
// sessão expirada). Nunca chama IA nem consome geração — é só a
// relação user_id/content_type/content_id em favorites.
export function FavoriteButton({
  contentType,
  contentId,
  initialFavorited,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const wasFavorited = favorited;
    setFavorited(!wasFavorited);
    startTransition(async () => {
      const result = await toggleFavoriteAction(contentType, contentId, wasFavorited);
      if ("error" in result) {
        setFavorited(wasFavorited);
      } else {
        setFavorited(result.favorited);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      className={className}
    >
      <StarIcon className={`h-4 w-4 ${favorited ? "fill-accent text-accent" : ""}`} />
      Favoritar
    </button>
  );
}
