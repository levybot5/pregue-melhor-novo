import type {
  SermonContent,
  BibleStudyContent,
  OutlineExpansionContent,
  PulpitOutlineContent,
  DevotionalContent,
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
    .map(
      (ponto, index) =>
        `${index + 1}. ${normalizeOutlinePointTitle(ponto.titulo)}\n${ponto.explicacao}\n${ponto.exemplo_aplicacao}`,
    )
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

export function formatBibleStudyForCopy(study: BibleStudyContent): string {
  const conexoes = study.conexoes_biblicas
    .map((conexao) => `${conexao.referencia}\n${conexao.explicacao}`)
    .join("\n\n");

  return joinBlocks([
    study.titulo,
    study.passagem,
    `VERDADE PRINCIPAL\n${study.verdade_principal}`,
    `CONTEXTO\n${study.contexto_biblico}`,
    `EXPLICAÇÃO\n${study.explicacao_texto}`,
    study.palavra_original
      ? `PALAVRA NO ORIGINAL\n${study.palavra_original.palavra} — ${study.palavra_original.significado}`
      : null,
    `CONEXÕES BÍBLICAS\n\n${conexoes}`,
    `APLICAÇÃO PARA A VIDA CRISTÃ\n${study.aplicacao_vida_crista}`,
    `CUIDADO DE INTERPRETAÇÃO\n${study.cuidado_interpretacao}`,
    `RESUMO\n${study.resumo_final}`,
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
