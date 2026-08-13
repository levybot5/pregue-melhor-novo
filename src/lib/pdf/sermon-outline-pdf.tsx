import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { SermonOutlineContent } from "@/services/ai";
import { PdfBulletList, PdfFooter, pdfStyles } from "./shared";

// PDF de Pregação para Esboço — compacto, só o resultado já salvo,
// nenhuma chamada de IA.
export function SermonOutlinePdfDocument({ outline }: { outline: SermonOutlineContent }) {
  return (
    <Document title={outline.titulo} language="pt-BR">
      <Page size="A4" style={pdfStyles.compactPage} wrap>
        <Text style={pdfStyles.compactTitle}>{outline.titulo}</Text>
        <Text style={pdfStyles.subtitle}>
          {[outline.texto_base, outline.ideia_central].filter(Boolean).join(" · ")}
        </Text>

        {outline.introducao.length > 0 && (
          <View style={pdfStyles.compactSection} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Introdução</Text>
            <PdfBulletList items={outline.introducao} compact />
          </View>
        )}

        {outline.pontos.map((ponto, index) => (
          <View style={pdfStyles.compactSection} key={index} wrap={false}>
            <Text style={pdfStyles.compactPointTitle}>
              {index + 1}. {ponto.titulo}
            </Text>
            {ponto.referencias.length > 0 && (
              <Text style={pdfStyles.compactParagraph}>{ponto.referencias.join(" · ")}</Text>
            )}
            <PdfBulletList items={ponto.bullets} compact />
            {ponto.frase_chave && (
              <View style={pdfStyles.highlightBox}>
                <Text style={pdfStyles.compactParagraph}>&ldquo;{ponto.frase_chave}&rdquo;</Text>
              </View>
            )}
            {ponto.aplicacao && (
              <Text style={pdfStyles.compactParagraph}>{ponto.aplicacao}</Text>
            )}
          </View>
        ))}

        {outline.conclusao.length > 0 && (
          <View style={pdfStyles.compactSection} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Conclusão</Text>
            <PdfBulletList items={outline.conclusao} compact />
          </View>
        )}

        {outline.apelo && (
          <View style={pdfStyles.compactSection} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Apelo</Text>
            <Text style={pdfStyles.compactParagraph}>{outline.apelo}</Text>
          </View>
        )}

        <PdfFooter label={outline.titulo} />
      </Page>
    </Document>
  );
}
