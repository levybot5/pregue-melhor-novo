import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { AulaBiblicaContent } from "@/services/ai";
import { PdfSection, PdfBulletList, PdfFooter, pdfStyles } from "./shared";

// PDF da Aula Bíblica — mesmo formato simples de uma coluna do
// devotional-pdf.tsx, com um bloco a mais para os 3 pontos de
// desenvolvimento e blocos condicionais para conceitos/atividade.
export function AulaBiblicaPdfDocument({ aula }: { aula: AulaBiblicaContent }) {
  return (
    <Document title={aula.titulo} language="pt-BR">
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.title}>{aula.titulo}</Text>
        <Text style={pdfStyles.subtitle}>{aula.texto_base}</Text>

        <PdfSection title="Objetivo da Aula" text={aula.objetivo_aula} />
        <PdfSection title="Introdução" text={aula.introducao} />
        <PdfSection title="Contexto Bíblico" text={aula.contexto_biblico} />

        <View style={pdfStyles.section} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Desenvolvimento</Text>
          {aula.pontos.map((ponto, index) => (
            <View style={{ marginBottom: 8 }} key={index}>
              <Text style={pdfStyles.pointTitle}>
                {index + 1}. {ponto.titulo}
              </Text>
              <Text style={pdfStyles.paragraph}>{ponto.explicacao}</Text>
              {ponto.referencias.length > 0 && (
                <Text style={pdfStyles.compactParagraph}>{ponto.referencias.join(" · ")}</Text>
              )}
              {ponto.exemplo_aplicacao && (
                <Text style={pdfStyles.paragraph}>{ponto.exemplo_aplicacao}</Text>
              )}
              <Text style={pdfStyles.compactParagraph}>
                Pergunta: {ponto.pergunta_participacao}
              </Text>
            </View>
          ))}
        </View>

        {aula.conceitos_importantes && (
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Conceitos Importantes</Text>
            {aula.conceitos_importantes.map((conceito, index) => (
              <View style={{ marginBottom: 4 }} key={index}>
                <Text style={pdfStyles.pointTitle}>{conceito.termo}</Text>
                <Text style={pdfStyles.paragraph}>{conceito.explicacao}</Text>
              </View>
            ))}
          </View>
        )}

        <PdfSection title="Aplicação Prática" text={aula.aplicacao_pratica} />

        <View style={pdfStyles.section} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Perguntas para Discussão</Text>
          <PdfBulletList items={aula.perguntas_discussao} />
        </View>

        {aula.atividade_dinamica && (
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Atividade: {aula.atividade_dinamica.titulo}</Text>
            <Text style={pdfStyles.paragraph}>{aula.atividade_dinamica.instrucoes}</Text>
          </View>
        )}

        <View style={pdfStyles.divider} />
        <PdfSection title="Conclusão" text={aula.conclusao} />
        <PdfSection title="Desafio da Semana" text={aula.desafio_semana} />

        <PdfFooter label={aula.titulo} />
      </Page>
    </Document>
  );
}
