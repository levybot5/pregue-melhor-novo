// Dado estrutural fixo dos 66 livros da Bíblia — mesmo padrão de
// src/lib/academy/course-data.ts (dado que não muda, não precisa de
// banco). `apiName` é o nome que a bible-api.com espera na URL pra
// buscar o capítulo (usado só pelo script de importação, nunca em
// runtime — depois de importado, tudo vem de `bible_verses`).
export type BibleBook = {
  slug: string;
  name: string;
  testament: "AT" | "NT";
  chapters: number;
  apiName: string;
};

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento
  { slug: "genesis", name: "Gênesis", testament: "AT", chapters: 50, apiName: "genesis" },
  { slug: "exodo", name: "Êxodo", testament: "AT", chapters: 40, apiName: "exodus" },
  { slug: "levitico", name: "Levítico", testament: "AT", chapters: 27, apiName: "leviticus" },
  { slug: "numeros", name: "Números", testament: "AT", chapters: 36, apiName: "numbers" },
  { slug: "deuteronomio", name: "Deuteronômio", testament: "AT", chapters: 34, apiName: "deuteronomy" },
  { slug: "josue", name: "Josué", testament: "AT", chapters: 24, apiName: "joshua" },
  { slug: "juizes", name: "Juízes", testament: "AT", chapters: 21, apiName: "judges" },
  { slug: "rute", name: "Rute", testament: "AT", chapters: 4, apiName: "ruth" },
  { slug: "1samuel", name: "1 Samuel", testament: "AT", chapters: 31, apiName: "1 samuel" },
  { slug: "2samuel", name: "2 Samuel", testament: "AT", chapters: 24, apiName: "2 samuel" },
  { slug: "1reis", name: "1 Reis", testament: "AT", chapters: 22, apiName: "1 kings" },
  { slug: "2reis", name: "2 Reis", testament: "AT", chapters: 25, apiName: "2 kings" },
  { slug: "1cronicas", name: "1 Crônicas", testament: "AT", chapters: 29, apiName: "1 chronicles" },
  { slug: "2cronicas", name: "2 Crônicas", testament: "AT", chapters: 36, apiName: "2 chronicles" },
  { slug: "esdras", name: "Esdras", testament: "AT", chapters: 10, apiName: "ezra" },
  { slug: "neemias", name: "Neemias", testament: "AT", chapters: 13, apiName: "nehemiah" },
  { slug: "ester", name: "Ester", testament: "AT", chapters: 10, apiName: "esther" },
  { slug: "jo", name: "Jó", testament: "AT", chapters: 42, apiName: "job" },
  { slug: "salmos", name: "Salmos", testament: "AT", chapters: 150, apiName: "psalms" },
  { slug: "proverbios", name: "Provérbios", testament: "AT", chapters: 31, apiName: "proverbs" },
  { slug: "eclesiastes", name: "Eclesiastes", testament: "AT", chapters: 12, apiName: "ecclesiastes" },
  { slug: "cantares", name: "Cantares", testament: "AT", chapters: 8, apiName: "song of solomon" },
  { slug: "isaias", name: "Isaías", testament: "AT", chapters: 66, apiName: "isaiah" },
  { slug: "jeremias", name: "Jeremias", testament: "AT", chapters: 52, apiName: "jeremiah" },
  { slug: "lamentacoes", name: "Lamentações", testament: "AT", chapters: 5, apiName: "lamentations" },
  { slug: "ezequiel", name: "Ezequiel", testament: "AT", chapters: 48, apiName: "ezekiel" },
  { slug: "daniel", name: "Daniel", testament: "AT", chapters: 12, apiName: "daniel" },
  { slug: "oseias", name: "Oséias", testament: "AT", chapters: 14, apiName: "hosea" },
  { slug: "joel", name: "Joel", testament: "AT", chapters: 3, apiName: "joel" },
  { slug: "amos", name: "Amós", testament: "AT", chapters: 9, apiName: "amos" },
  { slug: "obadias", name: "Obadias", testament: "AT", chapters: 1, apiName: "obadiah" },
  { slug: "jonas", name: "Jonas", testament: "AT", chapters: 4, apiName: "jonah" },
  { slug: "miqueias", name: "Miquéias", testament: "AT", chapters: 7, apiName: "micah" },
  { slug: "naum", name: "Naum", testament: "AT", chapters: 3, apiName: "nahum" },
  { slug: "habacuque", name: "Habacuque", testament: "AT", chapters: 3, apiName: "habakkuk" },
  { slug: "sofonias", name: "Sofonias", testament: "AT", chapters: 3, apiName: "zephaniah" },
  { slug: "ageu", name: "Ageu", testament: "AT", chapters: 2, apiName: "haggai" },
  { slug: "zacarias", name: "Zacarias", testament: "AT", chapters: 14, apiName: "zechariah" },
  { slug: "malaquias", name: "Malaquias", testament: "AT", chapters: 4, apiName: "malachi" },

  // Novo Testamento
  { slug: "mateus", name: "Mateus", testament: "NT", chapters: 28, apiName: "matthew" },
  { slug: "marcos", name: "Marcos", testament: "NT", chapters: 16, apiName: "mark" },
  { slug: "lucas", name: "Lucas", testament: "NT", chapters: 24, apiName: "luke" },
  { slug: "joao", name: "João", testament: "NT", chapters: 21, apiName: "john" },
  { slug: "atos", name: "Atos", testament: "NT", chapters: 28, apiName: "acts" },
  { slug: "romanos", name: "Romanos", testament: "NT", chapters: 16, apiName: "romans" },
  { slug: "1corintios", name: "1 Coríntios", testament: "NT", chapters: 16, apiName: "1 corinthians" },
  { slug: "2corintios", name: "2 Coríntios", testament: "NT", chapters: 13, apiName: "2 corinthians" },
  { slug: "galatas", name: "Gálatas", testament: "NT", chapters: 6, apiName: "galatians" },
  { slug: "efesios", name: "Efésios", testament: "NT", chapters: 6, apiName: "ephesians" },
  { slug: "filipenses", name: "Filipenses", testament: "NT", chapters: 4, apiName: "philippians" },
  { slug: "colossenses", name: "Colossenses", testament: "NT", chapters: 4, apiName: "colossians" },
  { slug: "1tessalonicenses", name: "1 Tessalonicenses", testament: "NT", chapters: 5, apiName: "1 thessalonians" },
  { slug: "2tessalonicenses", name: "2 Tessalonicenses", testament: "NT", chapters: 3, apiName: "2 thessalonians" },
  { slug: "1timoteo", name: "1 Timóteo", testament: "NT", chapters: 6, apiName: "1 timothy" },
  { slug: "2timoteo", name: "2 Timóteo", testament: "NT", chapters: 4, apiName: "2 timothy" },
  { slug: "tito", name: "Tito", testament: "NT", chapters: 3, apiName: "titus" },
  { slug: "filemom", name: "Filemom", testament: "NT", chapters: 1, apiName: "philemon" },
  { slug: "hebreus", name: "Hebreus", testament: "NT", chapters: 13, apiName: "hebrews" },
  { slug: "tiago", name: "Tiago", testament: "NT", chapters: 5, apiName: "james" },
  { slug: "1pedro", name: "1 Pedro", testament: "NT", chapters: 5, apiName: "1 peter" },
  { slug: "2pedro", name: "2 Pedro", testament: "NT", chapters: 3, apiName: "2 peter" },
  { slug: "1joao", name: "1 João", testament: "NT", chapters: 5, apiName: "1 john" },
  { slug: "2joao", name: "2 João", testament: "NT", chapters: 1, apiName: "2 john" },
  { slug: "3joao", name: "3 João", testament: "NT", chapters: 1, apiName: "3 john" },
  { slug: "judas", name: "Judas", testament: "NT", chapters: 1, apiName: "jude" },
  { slug: "apocalipse", name: "Apocalipse", testament: "NT", chapters: 22, apiName: "revelation" },
];

// Identificador estável de versículo, usado em grifos/anotações/cache
// de explicação — formato "livro.capitulo.versiculo" (ex.: "joao.3.16").
export function makeVerseId(book: string, chapter: number, verse: number): string {
  return `${book}.${chapter}.${verse}`;
}

export function getBook(slug: string): BibleBook | null {
  return BIBLE_BOOKS.find((b) => b.slug === slug) ?? null;
}

export function listBooksByTestament(testament: "AT" | "NT"): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => b.testament === testament);
}

export function getAdjacentChapter(
  slug: string,
  chapter: number,
  direction: "prev" | "next",
): { slug: string; chapter: number } | null {
  const index = BIBLE_BOOKS.findIndex((b) => b.slug === slug);
  if (index === -1) return null;
  const book = BIBLE_BOOKS[index];

  if (direction === "next") {
    if (chapter < book.chapters) return { slug, chapter: chapter + 1 };
    const nextBook = BIBLE_BOOKS[index + 1];
    return nextBook ? { slug: nextBook.slug, chapter: 1 } : null;
  }

  if (chapter > 1) return { slug, chapter: chapter - 1 };
  const prevBook = BIBLE_BOOKS[index - 1];
  return prevBook ? { slug: prevBook.slug, chapter: prevBook.chapters } : null;
}
