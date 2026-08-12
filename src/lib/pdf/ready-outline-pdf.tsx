import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { ReadyOutline } from "@/services/database";
import { PdfBulletList, PdfFooter, pdfStyles } from "./shared";

// PDF de um Esboço Pronto (acervo editorial, não gerado por IA) —
// compacto, pensado pra imprimir em poucas páginas.
export function ReadyOutlinePdfDocument({ outline }: { outline: ReadyOutline }) {
  return (
    <Document title={outline.title} language="pt-BR">
      <Page size="A4" style={pdfStyles.compactPage} wrap>
        <Text style={pdfStyles.compactTitle}>{outline.title}</Text>
        <Text style={pdfStyles.subtitle}>
          {outline.base_text} · {outline.central_idea}
        </Text>

        <View style={pdfStyles.compactSection} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Introdução</Text>
          <Text style={pdfStyles.compactParagraph}>{outline.short_introduction}</Text>
        </View>

        {outline.points.map((ponto, index) => (
          <View style={pdfStyles.compactSection} key={index} wrap={false}>
            <Text style={pdfStyles.compactPointTitle}>
              {index + 1}. {ponto.title}
            </Text>
            <PdfBulletList items={ponto.bullets} compact />
          </View>
        ))}

        <View style={pdfStyles.compactSection} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Aplicações</Text>
          <PdfBulletList items={outline.applications} compact />
        </View>

        {outline.conclusion_appeal && (
          <View style={pdfStyles.compactSection} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Conclusão / Apelo</Text>
            <Text style={pdfStyles.compactParagraph}>{outline.conclusion_appeal}</Text>
          </View>
        )}

        <PdfFooter label={outline.title} />
      </Page>
    </Document>
  );
}
