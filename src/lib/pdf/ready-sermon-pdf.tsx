import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { ReadySermon } from "@/services/database";
import { PdfSection, PdfFooter, pdfStyles } from "./shared";

// PDF de uma Pregação Pronta (acervo editorial, não gerado por IA) —
// usa só o que já está salvo no registro.
export function ReadySermonPdfDocument({ sermon }: { sermon: ReadySermon }) {
  return (
    <Document title={sermon.title} language="pt-BR">
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.title}>{sermon.title}</Text>
        <Text style={pdfStyles.subtitle}>
          {sermon.base_text} · {sermon.short_description}
        </Text>

        <PdfSection title="Introdução" text={sermon.introduction} />

        {sermon.points.map((ponto, index) => (
          <View style={pdfStyles.section} key={index} wrap={false}>
            <Text style={pdfStyles.pointTitle}>
              {index + 1}. {ponto.title}
            </Text>
            <Text style={pdfStyles.paragraph}>{ponto.text}</Text>
          </View>
        ))}

        <PdfSection title="Aplicação" text={sermon.application} />
        <PdfSection title="Conclusão" text={sermon.conclusion} />
        <PdfSection title="Apelo" text={sermon.appeal} />
        <PdfSection title="Oração" text={sermon.prayer} />

        <PdfFooter label={sermon.title} />
      </Page>
    </Document>
  );
}
