// Camada de geração por IA. Único ponto do app que fala com o provedor
// de IA — componentes e actions só conhecem generateSermon(input).
//
// Troca de provedor: hoje o Gemini é chamado em ./gemini-client.ts, o
// único arquivo que importa o SDK do Google. Trocar de provedor (ou
// suportar mais de um) significa mexer em ./gemini-client.ts e na
// chamada dentro de ./sermon.ts — nunca na UI ou nas Server Actions.
//
// Regras:
// - Toda chamada acontece no backend (Server Action), nunca no cliente.
// - Nenhuma chave de API é exposta ao frontend (GEMINI_API_KEY é
//   server-only, nunca NEXT_PUBLIC_).
// - 1 clique do usuário = no máximo 1 chamada de geração. Sem retry
//   automático, sem chamadas em useEffect/load/refresh/autosave.

export { generateSermon, sermonContentSchema, sermonAudiences, sermonStyles, sermonDurations } from "./sermon";
export type { SermonInput, SermonContent, GenerateSermonResult } from "./sermon";
