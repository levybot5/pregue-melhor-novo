import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { PulpitOutlineContent } from "@/services/ai";
import { PdfBulletList, PdfFooter, pdfStyles } from "./shared";

// PDF do Esboço para Púlpito — compacto, pensado pra imprimir em poucas
// páginas. Usa exclusivamente o conteúdo já salvo, sem chamada de IA.
export function PulpitOutlinePdfDocument({ outline }: { outline: PulpitOutlineContent }) {
  return (
    <Document title={outline.tema} language="pt-BR">
      <Page size="A4" style={pdfStyles.compactPage} wrap>
        <Text style={pdfStyles.compactTitle}>{outline.tema}</Text>
        <Text style={pdfStyles.subtitle}>
          {outline.texto_base} · {outline.ideia_central}
        </Text>

        <View style={pdfStyles.compactSection} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Introdução</Text>
          <PdfBulletList items={outline.introducao} compact />
        </View>

        {outline.pontos.map((ponto, index) => (
          <View style={pdfStyles.compactSection} key={index} wrap={false}>
            <Text style={pdfStyles.compactPointTitle}>
              {index + 1}. {ponto.titulo}
            </Text>
            <Text style={pdfStyles.compactParagraph}>{ponto.texto_relacionado}</Text>
            <PdfBulletList items={ponto.bullets} compact />
            <View style={pdfStyles.highlightBox}>
              <Text style={pdfStyles.compactParagraph}>&ldquo;{ponto.frase_impacto}&rdquo;</Text>
            </View>
          </View>
        ))}

        <View style={pdfStyles.compactSection} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Aplicação</Text>
          <PdfBulletList items={outline.aplicacao_final} compact />
        </View>

        <View style={pdfStyles.compactSection} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Apelo</Text>
          <Text style={pdfStyles.compactParagraph}>{outline.apelo}</Text>
        </View>

        <View style={pdfStyles.compactSection} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Oração</Text>
          <Text style={pdfStyles.compactParagraph}>{outline.oracao}</Text>
        </View>

        <PdfFooter label={outline.tema} />
      </Page>
    </Document>
  );
}
