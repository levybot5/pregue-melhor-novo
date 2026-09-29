// Importação única do texto da Bíblia Livre (BLIVRE — licença Creative
// Commons Atribuição 3.0 Brasil, uso comercial permitido com citação
// de fonte) para a tabela bible_verses, versão "blivre" — ao lado da
// ACF já importada (scripts/import-bible.mjs), nunca substituindo.
// Roda uma vez, manualmente — não faz parte do build nem do deploy.
//
// Fonte: arquivos .txt brutos do repositório público blivre/BibliaLivre
// (textos/f4/geral/*.txt), formato próprio deles com marcação de
// variante textual ({tr|rp} vs {n4}) e blocos de nota de rodapé
// (\fn...\*fn) e referência cruzada (\ref...\*ref) — ver comentários
// no parser abaixo. Verificado manualmente contra o parser oficial
// deles (conversores/inclusao_condicional.js, que gera a versão "TR")
// antes de escrever este script.
//
// Uso: node scripts/import-bible-livre.mjs

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

const VERSION = "blivre";
const BASE_URL = "https://raw.githubusercontent.com/blivre/BibliaLivre/master/textos/f4/geral";
const BATCH_SIZE = 2000;

// Mesma lista/ordem de scripts/import-bible.mjs (e de
// src/lib/bible/books-data.ts) — cada slug mapeado pro nome de
// arquivo real do repositório BLIVRE (conferido 1 a 1, ver relatório
// desta etapa).
const BOOK_FILES = {
  genesis: "gen", exodo: "exod", levitico: "lev", numeros: "num",
  deuteronomio: "deut", josue: "jos", juizes: "juiz", rute: "rute",
  "1samuel": "1sa", "2samuel": "2sa", "1reis": "1rs", "2reis": "2rs",
  "1cronicas": "1crn", "2cronicas": "2crn", esdras: "esd", neemias: "nee",
  ester: "est", jo: "jo", salmos: "sal", proverbios: "prov",
  eclesiastes: "ecl", cantares: "cant", isaias: "isa", jeremias: "jer",
  lamentacoes: "lam", ezequiel: "eze", daniel: "dan", oseias: "ose",
  joel: "joel", amos: "amos", obadias: "oba", jonas: "jon",
  miqueias: "miq", naum: "naum", habacuque: "hab", sofonias: "sof",
  ageu: "ageu", zacarias: "zac", malaquias: "mal",
  mateus: "mat", marcos: "mar", lucas: "luc", joao: "joao",
  atos: "atos", romanos: "rom", "1corintios": "1cor", "2corintios": "2cor",
  galatas: "gal", efesios: "efes", filipenses: "fil", colossenses: "col",
  "1tessalonicenses": "1tes", "2tessalonicenses": "2tes",
  "1timoteo": "1tim", "2timoteo": "2tim", tito: "tito", filemom: "flm",
  hebreus: "heb", tiago: "tiag", "1pedro": "1ped", "2pedro": "2ped",
  "1joao": "1joao", "2joao": "2joao", "3joao": "3joao", judas: "jud",
  apocalipse: "apo",
};

// Blocos inteiros excluídos do texto do versículo (nota de rodapé,
// referência cruzada, título de salmo) — nunca fazem parte da leitura
// corrida, viram ruído ou corrompem o versículo anterior se deixados
// soltos. Tags só de abertura/fechamento sem conteúdo próprio
// (\added, cabeçalho do arquivo) são apenas removidas da linha, sem
// excluir o que está dentro.
const BLOCK_TAGS = new Set(["fn", "ref", "psalm-title"]);
const STRIP_ONLY_TAGS = new Set([
  "added", "name-long", "name-short", "abbreviation", "ubs-code",
]);

// Marcadores de variante textual: {tr|rp} = leitura preferida (Textus
// Receptus/Robinson-Pierpont, a mesma escolhida como padrão pelo
// script oficial deles, conversores/001_GeraTR.bat, que gera a versão
// "tr" incluindo linhas marcadas tr/rp/trnc). {n4} = leitura
// alternativa (texto crítico), descartada aqui — ficamos com uma
// única leitura corrida, nunca as duas misturadas.
function keepByMarker(markers) {
  return markers.some((m) => m === "tr" || m === "rp" || m === "trnc");
}

function parseBookFile(raw, slug) {
  // Remove BOM inicial, se houver, e normaliza quebras de linha.
  const lines = raw.replace(/^﻿/, "").split(/\r\n|\r|\n/);

  const verses = []; // { chapter, verse, text }
  let currentChapter = null;
  let currentVerse = null;
  let currentParts = [];
  let blockDepth = 0; // >0 = dentro de \fn, \ref ou \psalm-title
  let sawFirstVerse = false;

  function flushVerse() {
    if (currentChapter == null || currentVerse == null) return;
    const text = currentParts.join("").replace(/\s+/g, " ").trim();
    if (text) {
      verses.push({ chapter: currentChapter, verse: currentVerse, text });
    } else {
      console.warn(`  aviso: ${currentChapter}:${currentVerse} ficou vazio depois de filtrar`);
    }
    // Rede de segurança contra typo na fonte (achado real: um "*fn"
    // faltando a barra em Lucas 7:28 nunca fechava o bloco, e sem isso
    // corrompia o resto do arquivo inteiro — 821 versículos sumiam).
    // Bloco de nota/referência nunca atravessa um limite de versículo
    // neste corpus, então resetar aqui contém o estrago de qualquer
    // tag malformada a no máximo o próprio versículo onde ela está.
    if (blockDepth !== 0) {
      console.warn(`  aviso: blockDepth=${blockDepth} não fechado ao final de ${currentChapter}:${currentVerse} — resetando`);
      blockDepth = 0;
    }
    currentParts = [];
  }

  for (const line of lines) {
    // trimmed SÓ pra reconhecer marcadores de estrutura (\v, tags,
    // {marcador}) — nunca usado como o texto que vai pro versículo.
    // Espaço no início/fim de uma linha de conteúdo é significativo
    // aqui (é o que separa as palavras quando linhas são concatenadas
    // sem nenhum separador extra) — um trimEnd() cedo demais já
    // grudou palavras uma na outra numa primeira versão deste script
    // (ex.: "servo deJesus" em vez de "servo de Jesus").
    const trimmed = line.trim();

    // \v <Abrev>.<Cap>.<Vers> — só existe nos 66 livros reais (as
    // adaptações usam um formato de intervalo diferente,
    // "\v Mt 5.3-11", num arquivo à parte que este script nunca lê).
    const verseMatch = trimmed.match(/^\\v\s+\S*?\.(\d+)\.(\d+)$/);
    if (verseMatch) {
      flushVerse();
      currentChapter = Number(verseMatch[1]);
      currentVerse = Number(verseMatch[2]);
      sawFirstVerse = true;
      continue;
    }

    // Marcador de variante textual pode vir na frente de QUALQUER linha
    // — inclusive na frente de uma tag de bloco, ex.: "{trnc}\fn" (nota
    // de rodapé marcada só pra leitura "trnc") ou "{n4}\fn" (nota de
    // rodapé da leitura alternativa, descartada). Por isso o marcador
    // é resolvido ANTES de checar se o resto da linha é uma tag —
    // achado real testando: sem isso, "{trnc}\fn"/"{trnc}\*fn" nunca
    // eram reconhecidas como abrindo/fechando bloco, e a nota de
    // rodapé vazava pro texto do versículo. O marcador só pode estar
    // colado no INÍCIO real da linha (sem espaço antes), por isso usa
    // `line`, não `trimmed`, aqui — mas o que sobra em `content`
    // preserva qualquer espaço que viesse depois do "}".
    let content = line;
    let markerOk = true;
    const markerMatch = line.match(/^\{([^}]+)\}(.*)$/);
    if (markerMatch) {
      markerOk = keepByMarker(markerMatch[1].split("|"));
      content = markerMatch[2];
    }

    const tagMatch = content.trim().match(/^\\(\*?)([a-z-]+)$/);
    if (tagMatch) {
      if (!markerOk) continue; // toda a nota (abertura E fechamento) tem o mesmo marcador — nunca abre bloco pra leitura descartada
      const isClose = tagMatch[1] === "*";
      const tagName = tagMatch[2];
      if (BLOCK_TAGS.has(tagName)) {
        blockDepth += isClose ? -1 : 1;
      } else if (!STRIP_ONLY_TAGS.has(tagName)) {
        console.warn(`  aviso: tag desconhecida "\\${tagName}" (linha removida, sem efeito no bloco)`);
      }
      continue;
    }

    // Typo real e pontual na fonte (Lucas 7:28: "{trnc}*fn" sem a
    // barra, deveria ser "\*fn") — só tolerado como fechamento quando
    // já estamos dentro de um bloco (blockDepth > 0), pra nunca
    // confundir uma linha de conteúdo real que por acaso começasse
    // com "*" (não existe nenhum caso assim no corpus).
    if (blockDepth > 0) {
      const looseCloseMatch = content.trim().match(/^\*([a-z-]+)$/);
      if (looseCloseMatch && markerOk && BLOCK_TAGS.has(looseCloseMatch[1])) {
        blockDepth -= 1;
        continue;
      }
    }

    if (!sawFirstVerse || blockDepth > 0) continue; // cabeçalho do arquivo ou dentro de bloco excluído
    if (!markerOk) continue; // conteúdo da leitura alternativa (ex.: {n4}), não escolhida

    currentParts.push(content);
  }
  flushVerse();

  return verses.map((v) => ({
    book: slug,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text,
    version: VERSION,
  }));
}

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const slugs = Object.keys(BOOK_FILES);
  const allRows = [];

  for (const slug of slugs) {
    const filename = BOOK_FILES[slug];
    const url = `${BASE_URL}/${encodeURIComponent(filename)}.txt`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Falha ao baixar ${url}: HTTP ${res.status}`);
    }
    const raw = await res.text();
    const rows = parseBookFile(raw, slug);
    if (rows.length === 0) {
      throw new Error(`${slug} (${filename}.txt) não gerou nenhum versículo — parser quebrado?`);
    }
    allRows.push(...rows);
    console.log(`${slug.padEnd(20)} ${rows.length} versículos`);
  }

  console.log(`\n${allRows.length} versículos prontos pra importar (${slugs.length} livros).`);

  if (DRY_RUN) {
    const suspicious = allRows.filter((r) => r.text.length < 3);
    console.log(`\nVersículos suspeitos (texto com menos de 3 caracteres): ${suspicious.length}`);
    for (const s of suspicious.slice(0, 20)) {
      console.log(`  ${s.book} ${s.chapter}:${s.verse} -> "${s.text}"`);
    }

    // Supabase/PostgREST limita a 1000 linhas por página por padrão —
    // sem paginar aqui, a comparação ficava com só as primeiras 1000
    // linhas do ACF (de 31 mil+) e quase tudo parecia "extra" por
    // engano (achado real testando: Gênesis 1:1 aparecia como
    // "não existe no ACF", o que é absurdo).
    const acfRows = [];
    for (let from = 0; ; from += 1000) {
      const { data: page, error: pageError } = await supabase
        .from("bible_verses")
        .select("book, chapter, verse")
        .eq("version", "acf")
        .range(from, from + 999);
      if (pageError) throw pageError;
      acfRows.push(...page);
      if (page.length < 1000) break;
    }
    const acfCount = acfRows.length;
    console.log(`\nTotal blivre: ${allRows.length} | Total acf (já importado): ${acfCount} | Diferença: ${allRows.length - acfCount}`);

    const blivreSet = new Set(allRows.map((r) => `${r.book}:${r.chapter}:${r.verse}`));
    const acfSet = new Set(acfRows.map((r) => `${r.book}:${r.chapter}:${r.verse}`));
    const missing = acfRows.filter((r) => !blivreSet.has(`${r.book}:${r.chapter}:${r.verse}`));
    const extra = allRows.filter((r) => !acfSet.has(`${r.book}:${r.chapter}:${r.verse}`));
    console.log(`\nVersículos que existem no ACF mas faltam no blivre: ${missing.length}`);
    console.log(`Versículos que existem no blivre mas não no ACF (numeração diferente): ${extra.length}`);
    const byBook = {};
    for (const m of missing) byBook[m.book] = (byBook[m.book] ?? 0) + 1;
    console.log(JSON.stringify(byBook, null, 2));
    console.log(
      "Primeiros 30 faltando:",
      missing.slice(0, 30).map((m) => `${m.book} ${m.chapter}:${m.verse}`),
    );

    const check = (book, chapter, verse) =>
      allRows.find((r) => r.book === book && r.chapter === chapter && r.verse === verse)?.text;
    console.log("\n--- amostras pra conferência manual ---");
    console.log("Romanos 1:1     :", check("romanos", 1, 1));
    console.log("João 3:15       :", check("joao", 3, 15));
    console.log("João 3:16       :", check("joao", 3, 16));
    console.log("1 Coríntios 1:26:", check("1corintios", 1, 26));
    console.log("1 Coríntios 2:9 :", check("1corintios", 2, 9));
    console.log("Salmo 23:1      :", check("salmos", 23, 1));
    console.log("Salmo 23:6      :", check("salmos", 23, 6));
    return;
  }

  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("bible_verses")
      .upsert(batch, { onConflict: "book,chapter,verse,version" });

    if (error) {
      throw new Error(`Falha ao inserir lote ${i}-${i + batch.length}: ${error.message}`);
    }
    console.log(`  ${Math.min(i + BATCH_SIZE, allRows.length)}/${allRows.length} versículos gravados`);
  }

  console.log("\nImportação concluída.");
}

main().catch((error) => {
  console.error("Falha geral na importação:", error);
  process.exit(1);
});
