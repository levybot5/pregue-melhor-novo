import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { SermonContent, OutlineExpansionContent } from "@/services/ai";
import { normalizeOutlinePointTitle } from "../outline";
import { PdfSection, PdfBulletList, PdfFooter, pdfStyles } from "./shared";

// Pregação Completa e Esboço em Pregação têm formatos quase idênticos
// (mesmo os nomes de campo variando um pouco), então os dois usam o
// mesmo template de PDF a partir de um formato comum abaixo. Só
// reorganiza dados já salvos — nenhuma chamada de IA acontece aqui.
type SermonPdfPoint = {
  titulo: string;
  explicacao: string;
  exemploAplicacao: string;
  palavraOriginal?: {
    palavra: string;
    idioma: string;
    transliteracao: string;
    significado: string;
    aplicacao: string;
  } | null;
};

type SermonPdfOutlinePoint = {
  titulo: string;
  itens: string[];
};

export type SermonPdfData = {
  titulo: string;
  textoBase: string;
  ideiaCentral: string;
  introducao: string;
  contexto?: string | null;
  pontos: SermonPdfPoint[];
  aplicacaoFinal: string;
  conclusao: string;
  apelo: string;
  oracaoFinal: string;
  esbocoPulpito: {
    pontos: SermonPdfOutlinePoint[];
    apelo: string;
  };
};

export function sermonToPdfData(sermon: SermonContent): SermonPdfData {
  return {
    titulo: sermon.titulo,
    textoBase: sermon.texto_base,
    ideiaCentral: sermon.tema_central,
    introducao: sermon.introducao,
    contexto: sermon.contexto_biblico,
    pontos: sermon.pontos.map((ponto) => ({
      titulo: normalizeOutlinePointTitle(ponto.titulo),
      explicacao: ponto.explicacao,
      exemploAplicacao: ponto.exemplo_aplicacao,
      palavraOriginal: ponto.palavra_original,
    })),
    aplicacaoFinal: sermon.aplicacao_final,
    conclusao: sermon.conclusao,
    apelo: sermon.apelo,
    oracaoFinal: sermon.oracao_final,
    esbocoPulpito: {
      pontos: sermon.esboco_pulpito.pontos.map((ponto) => ({
        titulo: normalizeOutlinePointTitle(ponto.titulo),
        itens: ponto.itens,
      })),
      apelo: sermon.esboco_pulpito.apelo,
    },
  };
}

export function outlineExpansionToPdfData(content: OutlineExpansionContent): SermonPdfData {
  return {
    titulo: content.titulo,
    textoBase: content.texto_base,
    ideiaCentral: content.ideia_central,
    introducao: content.introducao,
    contexto: content.contexto,
    pontos: content.pontos.map((ponto) => ({
      titulo: normalizeOutlinePointTitle(ponto.titulo),
      explicacao: ponto.explicacao,
      exemploAplicacao: ponto.exemplo_aplicacao,
    })),
    aplicacaoFinal: content.aplicacoes,
    conclusao: content.conclusao,
    apelo: content.apelo,
    oracaoFinal: content.oracao,
    esbocoPulpito: {
      pontos: content.esboco_pulpito.pontos.map((ponto) => ({
        titulo: normalizeOutlinePointTitle(ponto.titulo),
        itens: ponto.itens,
      })),
      apelo: content.esboco_pulpito.apelo,
    },
  };
}

export function SermonPdfDocument({ data }: { data: SermonPdfData }) {
  return (
    <Document title={data.titulo} language="pt-BR">
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.title}>{data.titulo}</Text>
        <Text style={pdfStyles.subtitle}>{data.textoBase}</Text>

        <PdfSection title="Ideia Central" text={data.ideiaCentral} />
        <PdfSection title="Introdução" text={data.introducao} />
        <PdfSection title="Contexto Bíblico" text={data.contexto} />

        {data.pontos.map((ponto, index) => (
          <View style={pdfStyles.section} key={index} wrap={false}>
            <Text style={pdfStyles.pointTitle}>
              {index + 1}. {ponto.titulo}
            </Text>
            <Text style={pdfStyles.paragraph}>{ponto.explicacao}</Text>
            {ponto.palavraOriginal && (
              <View style={pdfStyles.highlightBox}>
                <Text style={{ ...pdfStyles.paragraph, fontFamily: "Helvetica-Bold" }}>
                  Palavra no Original ({ponto.palavraOriginal.idioma}): {ponto.palavraOriginal.palavra}{" "}
                  ({ponto.palavraOriginal.transliteracao})
                </Text>
                <Text style={pdfStyles.paragraph}>{ponto.palavraOriginal.significado}</Text>
                <Text style={pdfStyles.paragraph}>{ponto.palavraOriginal.aplicacao}</Text>
              </View>
            )}
            <View style={pdfStyles.highlightBox}>
              <Text style={pdfStyles.paragraph}>{ponto.exemploAplicacao}</Text>
            </View>
          </View>
        ))}

        <PdfSection title="Aplicação" text={data.aplicacaoFinal} />
        <PdfSection title="Conclusão" text={data.conclusao} />
        <PdfSection title="Apelo" text={data.apelo} />
        <PdfSection title="Oração" text={data.oracaoFinal} />

        <View style={pdfStyles.divider} />

        <View style={pdfStyles.section} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Esboço para Púlpito</Text>
          {data.esbocoPulpito.pontos.map((ponto, index) => (
            <View style={{ marginBottom: 6 }} key={index}>
              <Text style={pdfStyles.pointTitle}>
                {index + 1}. {ponto.titulo}
              </Text>
              <PdfBulletList items={ponto.itens} />
            </View>
          ))}
          <View style={pdfStyles.highlightBox}>
            <Text style={pdfStyles.paragraph}>{data.esbocoPulpito.apelo}</Text>
          </View>
        </View>

        <PdfFooter label={data.titulo} />
      </Page>
    </Document>
  );
}
