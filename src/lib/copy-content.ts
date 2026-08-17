import type {
  SermonContent,
  BibleStudyContent,
  OutlineExpansionContent,
  PulpitOutlineContent,
  SermonOutlineContent,
  DevotionalContent,
  BibleDictionaryEntry,
} from "@/services/ai";
import type { ReadySermon, ReadyOutline } from "@/services/database";
import { normalizeOutlinePointTitle } from "./outline";

// Formatadores de texto puro para o botão "Copiar". Trabalham somente
// com conteúdo já salvo (recebido por parâmetro) — nenhuma chamada de
// IA ou rede acontece aqui.
function joinBlocks(blocks: (string | null | undefined)[]): string {
  return blocks.filter((block): block is string => Boolean(block && block.trim())).join("\n\n");
}

function bulletBlock(title: string, items: string[]): string {
  return `${title}\n${items.map((item) => `- ${item}`).join("\n")}`;
}

export function formatSermonForCopy(sermon: SermonContent): string {
  const pontos = sermon.pontos
    .map((ponto, index) => {
      const palavraOriginal = ponto.palavra_original
        ? `\nPalavra no Original (${ponto.palavra_original.idioma}): ${ponto.palavra_original.palavra} (${ponto.palavra_original.transliteracao})\n${ponto.palavra_original.significado}\n${ponto.palavra_original.aplicacao}`
        : "";
      return `${index + 1}. ${normalizeOutlinePointTitle(ponto.titulo)}\n${ponto.explicacao}${palavraOriginal}\n${ponto.exemplo_aplicacao}`;
    })
    .join("\n\n");

  const esbocoPulpito = sermon.esboco_pulpito.pontos
    .map((ponto, index) =>
      bulletBlock(`${index + 1}. ${normalizeOutlinePointTitle(ponto.titulo)}`, ponto.itens),
    )
    .join("\n\n");

  return joinBlocks([
    sermon.titulo,
    sermon.texto_base,
    `IDEIA CENTRAL\n${sermon.tema_central}`,
    `INTRODUÇÃO\n${sermon.introducao}`,
    `CONTEXTO BÍBLICO\n${sermon.contexto_biblico}`,
    pontos,
    `APLICAÇÃO\n${sermon.aplicacao_final}`,
    `CONCLUSÃO\n${sermon.conclusao}`,
    `APELO\n${sermon.apelo}`,
    `ORAÇÃO\n${sermon.oracao_final}`,
    `ESBOÇO PARA PÚLPITO\n\n${esbocoPulpito}\n\n${sermon.esboco_pulpito.apelo}`,
  ]);
}

export function formatOutlineExpansionForCopy(content: OutlineExpansionContent): string {
  const pontos = content.pontos
    .map(
      (ponto, index) =>
        `${index + 1}. ${normalizeOutlinePointTitle(ponto.titulo)}\n${ponto.explicacao}\n${ponto.exemplo_aplicacao}`,
    )
    .join("\n\n");

  const esbocoPulpito = content.esboco_pulpito.pontos
    .map((ponto, index) =>
      bulletBlock(`${index + 1}. ${normalizeOutlinePointTitle(ponto.titulo)}`, ponto.itens),
    )
    .join("\n\n");

  return joinBlocks([
    content.titulo,
    content.texto_base,
    `IDEIA CENTRAL\n${content.ideia_central}`,
    `INTRODUÇÃO\n${content.introducao}`,
    content.contexto ? `CONTEXTO\n${content.contexto}` : null,
    pontos,
    `APLICAÇÃO\n${content.aplicacoes}`,
    `CONCLUSÃO\n${content.conclusao}`,
    `APELO\n${content.apelo}`,
    `ORAÇÃO\n${content.oracao}`,
    `ESBOÇO PARA PÚLPITO\n\n${esbocoPulpito}\n\n${content.esboco_pulpito.apelo}`,
  ]);
}

export function formatPulpitOutlineForCopy(outline: PulpitOutlineContent): string {
  const pontos = outline.pontos
    .map((ponto, index) =>
      joinBlocks([
        `${index + 1}. ${ponto.titulo}`,
        ponto.texto_relacionado,
        ponto.bullets.map((bullet) => `- ${bullet}`).join("\n"),
        `"${ponto.frase_impacto}"`,
      ]),
    )
    .join("\n\n");

  return joinBlocks([
    outline.tema,
    `${outline.texto_base} · ${outline.ideia_central}`,
    bulletBlock("INTRODUÇÃO", outline.introducao),
    pontos,
    bulletBlock("APLICAÇÃO", outline.aplicacao_final),
    `APELO\n${outline.apelo}`,
    `ORAÇÃO\n${outline.oracao}`,
  ]);
}

export function formatSermonOutlineForCopy(outline: SermonOutlineContent): string {
  const pontos = outline.pontos
    .map((ponto, index) =>
      joinBlocks([
        `${index + 1}. ${ponto.titulo}`,
        ponto.referencias.length > 0 ? ponto.referencias.join(" · ") : null,
        ponto.bullets.map((bullet) => `- ${bullet}`).join("\n"),
        ponto.frase_chave ? `"${ponto.frase_chave}"` : null,
        ponto.aplicacao,
      ]),
    )
    .join("\n\n");

  return joinBlocks([
    outline.titulo,
    [outline.texto_base, outline.ideia_central].filter(Boolean).join(" · "),
    outline.introducao.length > 0 ? bulletBlock("INTRODUÇÃO", outline.introducao) : null,
    pontos,
    outline.conclusao.length > 0 ? bulletBlock("CONCLUSÃO", outline.conclusao) : null,
    outline.apelo ? `APELO\n${outline.apelo}` : null,
  ]);
}

export function formatBibleStudyForCopy(study: BibleStudyContent): string {
  const conexoes = study.conexoes_biblicas
    .map((conexao) => `${conexao.referencia}\n${conexao.explicacao}`)
    .join("\n\n");

  return joinBlocks([
    study.titulo,
    study.passagem,
    study.contexto ? `CONTEXTO\n${study.contexto}` : null,
    `EXPLICAÇÃO DO TEXTO\n${study.explicacao}`,
    study.palavra_original
      ? `PALAVRA NO ORIGINAL\n${study.palavra_original.termo} (${study.palavra_original.idioma}${study.palavra_original.transliteracao ? `, ${study.palavra_original.transliteracao}` : ""})\n${study.palavra_original.significado}\n${study.palavra_original.explicacao}`
      : null,
    `CONEXÕES BÍBLICAS\n\n${conexoes}`,
    `APLICAÇÃO PRÁTICA\n${study.aplicacao}`,
    `RESUMO\n${study.resumo}`,
  ]);
}

export function formatBibleDictionaryForCopy(entry: BibleDictionaryEntry): string {
  if (entry.tipo === "pessoa") {
    const { secoes_pessoa } = entry;
    return joinBlocks([
      entry.termo,
      entry.identificacao,
      secoes_pessoa.contexto ? `CONTEXTO\n${secoes_pessoa.contexto}` : null,
      secoes_pessoa.principais_acontecimentos
        ? `PRINCIPAIS ACONTECIMENTOS\n${secoes_pessoa.principais_acontecimentos}`
        : null,
      secoes_pessoa.caracteristicas ? `CARACTERÍSTICAS\n${secoes_pessoa.caracteristicas}` : null,
      secoes_pessoa.acertos ? `ACERTOS\n${secoes_pessoa.acertos}` : null,
      secoes_pessoa.erros ? `ERROS\n${secoes_pessoa.erros}` : null,
      bulletBlock("REFERÊNCIAS PRINCIPAIS", entry.referencias_biblicas),
      secoes_pessoa.licoes ? `LIÇÕES\n${secoes_pessoa.licoes}` : null,
    ]);
  }

  const secoes = entry.secoes
    .map((secao) => `${secao.titulo.toUpperCase()}\n${secao.conteudo}`)
    .join("\n\n");

  return joinBlocks([
    entry.termo,
    entry.identificacao,
    secoes,
    bulletBlock("REFERÊNCIAS BÍBLICAS", entry.referencias_biblicas),
  ]);
}

export function formatDevotionalForCopy(devotional: DevotionalContent): string {
  return joinBlocks([
    devotional.titulo,
    devotional.texto_base,
    `REFLEXÃO\n${devotional.reflexao}`,
    `APLICAÇÃO\n${devotional.aplicacao}`,
    `ORAÇÃO\n${devotional.oracao}`,
    `VERSÍCULO PARA GUARDAR\n${devotional.versiculo_para_guardar}`,
  ]);
}

export function formatReadySermonForCopy(sermon: ReadySermon): string {
  const points = sermon.points
    .map((ponto, index) => `${index + 1}. ${ponto.title}\n${ponto.text}`)
    .join("\n\n");

  return joinBlocks([
    sermon.title,
    `${sermon.base_text} · ${sermon.short_description}`,
    `INTRODUÇÃO\n${sermon.introduction}`,
    points,
    `APLICAÇÃO\n${sermon.application}`,
    `CONCLUSÃO\n${sermon.conclusion}`,
    sermon.appeal ? `APELO\n${sermon.appeal}` : null,
    sermon.prayer ? `ORAÇÃO\n${sermon.prayer}` : null,
  ]);
}

export function formatReadyOutlineForCopy(outline: ReadyOutline): string {
  const points = outline.points
    .map((ponto, index) => bulletBlock(`${index + 1}. ${ponto.title}`, ponto.bullets))
    .join("\n\n");

  return joinBlocks([
    outline.title,
    `${outline.base_text} · ${outline.central_idea}`,
    `INTRODUÇÃO\n${outline.short_introduction}`,
    points,
    bulletBlock("APLICAÇÕES", outline.applications),
    outline.conclusion_appeal ? `CONCLUSÃO / APELO\n${outline.conclusion_appeal}` : null,
  ]);
}
