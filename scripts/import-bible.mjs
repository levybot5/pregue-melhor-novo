// Importação única do texto da Bíblia (tradução ACF — Almeida
// Corrigida Fiel, de distribuição livre) para a tabela bible_verses.
// Roda uma vez, manualmente — não faz parte do build nem do deploy.
//
// Fonte: um único arquivo JSON estático (não uma API por requisição),
// do repositório público thiagobodruk/biblia — evita completamente o
// risco de rate limit que uma API por-capítulo teria.
//
// Uso: node scripts/import-bible.mjs

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const VERSION = "acf";
const SOURCE_URL = "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json";
const BATCH_SIZE = 2000;

// Mesma lista e mesma ordem de src/lib/bible/books-data.ts, duplicada
// aqui de propósito (este script roda fora do Next.js). A ordem bate
// exatamente com a ordem dos livros no JSON de origem — por isso o
// zip é feito por índice, sem precisar mapear abreviação por nome.
const BOOK_SLUGS = [
  "genesis", "exodo", "levitico", "numeros", "deuteronomio", "josue", "juizes", "rute",
  "1samuel", "2samuel", "1reis", "2reis", "1cronicas", "2cronicas", "esdras", "neemias",
  "ester", "jo", "salmos", "proverbios", "eclesiastes", "cantares", "isaias", "jeremias",
  "lamentacoes", "ezequiel", "daniel", "oseias", "joel", "amos", "obadias", "jonas",
  "miqueias", "naum", "habacuque", "sofonias", "ageu", "zacarias", "malaquias",
  "mateus", "marcos", "lucas", "joao", "atos", "romanos", "1corintios", "2corintios",
  "galatas", "efesios", "filipenses", "colossenses", "1tessalonicenses", "2tessalonicenses",
  "1timoteo", "2timoteo", "tito", "filemom", "hebreus", "tiago", "1pedro", "2pedro",
  "1joao", "2joao", "3joao", "judas", "apocalipse",
];

async function main() {
  console.log(`Baixando ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Falha ao baixar o JSON de origem: HTTP ${res.status}`);
  }
  let raw = await res.text();
  raw = raw.replace(/^﻿/, ""); // remove BOM, se houver
  const books = JSON.parse(raw);

  if (books.length !== BOOK_SLUGS.length) {
    throw new Error(
      `Esperava ${BOOK_SLUGS.length} livros no JSON de origem, encontrei ${books.length} — conferir antes de importar.`,
    );
  }

  const rows = [];
  for (let i = 0; i < books.length; i++) {
    const slug = BOOK_SLUGS[i];
    const book = books[i];
    book.chapters.forEach((chapterVerses, chapterIndex) => {
      chapterVerses.forEach((text, verseIndex) => {
        rows.push({
          book: slug,
          chapter: chapterIndex + 1,
          verse: verseIndex + 1,
          text: text.trim(),
          version: VERSION,
        });
      });
    });
  }

  console.log(`${rows.length} versículos prontos pra importar (${books.length} livros).`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("bible_verses")
      .upsert(batch, { onConflict: "book,chapter,verse,version" });

    if (error) {
      throw new Error(`Falha ao inserir lote ${i}-${i + batch.length}: ${error.message}`);
    }
    console.log(`  ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} versículos gravados`);
  }

  console.log("\nImportação concluída.");
}

main().catch((error) => {
  console.error("Falha geral na importação:", error);
  process.exit(1);
});
