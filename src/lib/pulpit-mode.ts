import type { SermonContent } from "@/services/ai";
import type { OutlineExpansionContent } from "@/services/ai";
import type { PulpitOutlineContent } from "@/services/ai";
import { normalizeOutlinePointTitle } from "./outline";

// Formato único e condensado que o Modo Púlpito sabe renderizar.
// Sempre construído a partir de conteúdo JÁ SALVO — nenhuma função
// aqui chama IA, nem faz rede: é só reorganização de dados.
export type PulpitModePoint = {
  titulo: string;
  itens: string[];
  fraseImpacto?: string;
};

export type PulpitModeContent = {
  tema: string;
  textoBase: string;
  ideiaCentral: string;
  introducao?: string;
  pontos: PulpitModePoint[];
  aplicacao?: string[];
  apelo: string;
};

// Pregação Completa já carrega um esboço_pulpito pronto — é exatamente
// o material condensado que o Modo Púlpito precisa.
export function sermonToPulpitMode(sermon: SermonContent): PulpitModeContent {
  return {
    tema: sermon.titulo,
    textoBase: sermon.texto_base,
    ideiaCentral: sermon.tema_central,
    introducao: sermon.introducao,
    pontos: sermon.esboco_pulpito.pontos.map((ponto) => ({
      titulo: normalizeOutlinePointTitle(ponto.titulo),
      itens: ponto.itens,
    })),
    aplicacao: [sermon.aplicacao_final],
    apelo: sermon.esboco_pulpito.apelo,
  };
}

export function outlineExpansionToPulpitMode(
  content: OutlineExpansionContent,
): PulpitModeContent {
  return {
    tema: content.titulo,
    textoBase: content.texto_base,
    ideiaCentral: content.ideia_central,
    introducao: content.introducao,
    pontos: content.esboco_pulpito.pontos.map((ponto) => ({
      titulo: normalizeOutlinePointTitle(ponto.titulo),
      itens: ponto.itens,
    })),
    aplicacao: [content.aplicacoes],
    apelo: content.esboco_pulpito.apelo,
  };
}

// O Esboço para Púlpito já É o formato condensado — só remapeia nomes.
export function pulpitOutlineToPulpitMode(
  outline: PulpitOutlineContent,
): PulpitModeContent {
  return {
    tema: outline.tema,
    textoBase: outline.texto_base,
    ideiaCentral: outline.ideia_central,
    introducao: outline.introducao.join(" • "),
    pontos: outline.pontos.map((ponto) => ({
      titulo: ponto.titulo,
      itens: ponto.bullets,
      fraseImpacto: ponto.frase_impacto,
    })),
    aplicacao: outline.aplicacao_final,
    apelo: outline.apelo,
  };
}
