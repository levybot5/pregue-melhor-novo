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

        <PdfSection title="Verdade Principal" text={study.verdade_principal} />
        <PdfSection title="Contexto" text={study.contexto_biblico} />
        <PdfSection title="Explicação" text={study.explicacao_texto} />

        {study.palavra_original && (
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Palavra no Original</Text>
            <Text style={pdfStyles.pointTitle}>{study.palavra_original.palavra}</Text>
            <Text style={pdfStyles.paragraph}>{study.palavra_original.significado}</Text>
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

        <PdfSection title="Aplicação para a Vida Cristã" text={study.aplicacao_vida_crista} />
        <PdfSection title="Cuidado de Interpretação" text={study.cuidado_interpretacao} />

        <View style={pdfStyles.divider} />

        <PdfSection title="Resumo" text={study.resumo_final} />

        <PdfFooter label={study.titulo} />
      </Page>
    </Document>
  );
}
