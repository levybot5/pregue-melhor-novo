// Camada de geração por IA. Único ponto do app que fala com o provedor
// de IA — componentes e actions só conhecem generateSermon(),
// generateBibleStudy(), expandOutline() e generatePulpitOutline().
//
// Troca de provedor: hoje o Gemini é chamado em ./gemini-client.ts, o
// único arquivo que importa o SDK do Google. Trocar de provedor (ou
// suportar mais de um) significa mexer em ./gemini-client.ts e nas
// chamadas dentro de ./generate.ts e ./sermon.ts — nunca na UI ou nas
// Server Actions.
//
// Regras:
// - Toda chamada acontece no backend (Server Action), nunca no cliente.
// - Nenhuma chave de API é exposta ao frontend (GEMINI_API_KEY é
//   server-only, nunca NEXT_PUBLIC_).
// - 1 clique do usuário = no máximo 1 chamada de geração. Sem retry
//   automático, sem chamadas em useEffect/load/refresh/autosave.

export {
  generateSermon,
  sermonContentSchema,
  sermonFormats,
  sermonAudiences,
  sermonStyles,
  sermonDurations,
  sermonDepths,
  bibleVersions,
} from "./sermon";
export type { SermonInput, SermonContent, GenerateSermonResult } from "./sermon";

export { generateBibleStudy, bibleStudyContentSchema } from "./bible-study";
export type { BibleStudyInput, BibleStudyContent } from "./bible-study";

export { generateVerseExplanation, bibleVerseExplanationSchema } from "./bible-verse";
export type { BibleVerseExplanationInput, BibleVerseExplanation } from "./bible-verse";

export {
  generateBibleDictionaryEntry,
  bibleDictionaryEntrySchema,
  bibleDictionaryTypes,
} from "./bible-dictionary";
export type {
  BibleDictionaryInput,
  BibleDictionaryEntry,
  BibleDictionaryType,
} from "./bible-dictionary";

export { expandOutline, outlineExpansionContentSchema } from "./outline-expansion";
export type { OutlineExpansionInput, OutlineExpansionContent } from "./outline-expansion";

// Formato antigo (pré "Pregação para Esboço") — só para ler conteúdo
// já salvo na Biblioteca, nunca para gerar conteúdo novo.
export { pulpitOutlineContentSchema } from "./pulpit-outline";
export type { PulpitOutlineContent } from "./pulpit-outline";

export {
  condenseSermonOutline,
  sermonOutlineContentSchema,
  sermonOutlineSummaryLevels,
} from "./sermon-outline";
export type {
  SermonOutlineInput,
  SermonOutlineContent,
  SermonOutlineSummaryLevel,
} from "./sermon-outline";

export { generateDevotional, devotionalContentSchema, devotionalMoments } from "./devotional";
export type { DevotionalInput, DevotionalContent, DevotionalMoment } from "./devotional";

export {
  ministryAudiences,
  ministryStyles,
  ministryDurations,
} from "./ministry-options";
export type { MinistryAudience, MinistryStyle, MinistryDuration } from "./ministry-options";

export {
  generateAulaBiblica,
  aulaBiblicaContentSchema,
  aulaBiblicaAmbientes,
  aulaBiblicaPublicos,
  aulaBiblicaDuracoes,
  aulaBiblicaProfundidades,
  aulaBiblicaBibleVersions,
} from "./aula-biblica";
export type { AulaBiblicaInput, AulaBiblicaContent } from "./aula-biblica";
