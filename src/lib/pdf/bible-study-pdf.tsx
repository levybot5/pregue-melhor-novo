import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { BibleStudyContent } from "@/services/ai";
import { PdfSection, PdfFooter, pdfStyles } from "./shared";

// PDF da Bíblia Explicada — usa exclusivamente o conteúdo já salvo,
// sem nenhuma chamada de IA.
export function BibleStudyPdfDocument({ study }: { study: BibleStudyContent }) {
  return (
    <Document title={study.titulo} language="pt-BR">
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.title}>{study.titulo}</Text>
        <Text style={pdfStyles.subtitle}>{study.passagem}</Text>

        {study.contexto && <PdfSection title="Contexto" text={study.contexto} />}
        <PdfSection title="Explicação do Texto" text={study.explicacao} />

        {study.palavra_original && (
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Palavra no Original</Text>
            <Text style={pdfStyles.pointTitle}>
              {study.palavra_original.termo}
              {study.palavra_original.transliteracao
                ? ` (${study.palavra_original.transliteracao})`
                : ""}
            </Text>
            <Text style={pdfStyles.paragraph}>{study.palavra_original.significado}</Text>
            <Text style={pdfStyles.paragraph}>{study.palavra_original.explicacao}</Text>
          </View>
        )}

        <View style={pdfStyles.section} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Conexões Bíblicas</Text>
          {study.conexoes_biblicas.map((conexao, index) => (
            <View style={{ marginBottom: 6 }} key={index}>
              <Text style={pdfStyles.pointTitle}>{conexao.referencia}</Text>
              <Text style={pdfStyles.paragraph}>{conexao.explicacao}</Text>
            </View>
          ))}
        </View>

        <PdfSection title="Aplicação Prática" text={study.aplicacao} />

        <View style={pdfStyles.divider} />

        <PdfSection title="Resumo" text={study.resumo} />

        <PdfFooter label={study.titulo} />
      </Page>
    </Document>
  );
}
