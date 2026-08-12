import { Document, Page, Text } from "@react-pdf/renderer";
import type { DevotionalContent } from "@/services/ai";
import { PdfSection, PdfFooter, pdfStyles } from "./shared";

// PDF do Devocional — curto por natureza, usa só o conteúdo já salvo.
export function DevotionalPdfDocument({ devotional }: { devotional: DevotionalContent }) {
  return (
    <Document title={devotional.titulo} language="pt-BR">
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.title}>{devotional.titulo}</Text>
        <Text style={pdfStyles.subtitle}>{devotional.texto_base}</Text>

        <PdfSection title="Reflexão" text={devotional.reflexao} />
        <PdfSection title="Aplicação" text={devotional.aplicacao} />
        <PdfSection title="Oração" text={devotional.oracao} />
        <PdfSection title="Versículo para Guardar" text={devotional.versiculo_para_guardar} />

        <PdfFooter label={devotional.titulo} />
      </Page>
    </Document>
  );
}
