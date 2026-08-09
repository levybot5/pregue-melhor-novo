// Camada de acesso a dados (Supabase). Único ponto do app que deve
// falar diretamente com o Supabase — componentes e actions consomem
// as funções abaixo, nunca o client bruto.

export { createContent, listContents, getContentById } from "./contents";
export type { Content, NewContent } from "./contents";
