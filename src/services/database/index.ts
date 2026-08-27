// Camada de acesso a dados (Supabase). Único ponto do app que deve
// falar diretamente com o Supabase — componentes e actions consomem
// as funções abaixo, nunca o client bruto.

export { createContent, listContents, getContentById, deleteContent } from "./contents";
export type { Content, NewContent } from "./contents";

export { getProfile, updateProfileName } from "./profiles";
export type { Profile } from "./profiles";

export {
  listCategories,
  listReadySermons,
  getReadySermonBySlug,
  listReadyOutlines,
  getReadyOutlineBySlug,
} from "./ready-content";
export type {
  ContentCategory,
  Testament,
  ReadySermon,
  ReadySermonSummary,
  ReadySermonPoint,
  ReadyOutline,
  ReadyOutlineSummary,
  ReadyOutlinePoint,
} from "./ready-content";

export { listFavoriteContentIds, addFavorite, removeFavorite } from "./favorites";
export type { FavoriteContentType } from "./favorites";
