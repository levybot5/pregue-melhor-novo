import { StyleSheet, Text, View } from "@react-pdf/renderer";

// Estilos e blocos reaproveitados pelos 3 templates de PDF. Nenhum
// arquivo desta pasta chama IA ou rede — só formata conteúdo já salvo.
// Fonte padrão (Helvetica, WinAnsi) já cobre acentuação do português,
// então não é preciso registrar fontes externas.

export const PDF_COLORS = {
  text: "#1a1a1a",
  muted: "#5a5a5a",
  accent: "#2b5f8f",
  border: "#d9d9d9",
  soft: "#f2f4f6",
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 44,
    paddingHorizontal: 44,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: PDF_COLORS.text,
  },
  compactPage: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: PDF_COLORS.text,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: PDF_COLORS.muted,
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  compactSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    color: PDF_COLORS.accent,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  compactParagraph: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletMark: {
    width: 10,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
  },
  compactBulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.35,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    marginVertical: 8,
  },
  highlightBox: {
    backgroundColor: PDF_COLORS.soft,
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
  },
  pointTitle: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  compactPointTitle: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 44,
    right: 44,
    fontSize: 8,
    color: PDF_COLORS.muted,
    textAlign: "center",
  },
});

export function PdfSection({
  title,
  text,
  compact,
}: {
  title: string;
  text?: string | null;
  compact?: boolean;
}) {
  if (!text) return null;
  return (
    <View style={compact ? pdfStyles.compactSection : pdfStyles.section} wrap={false}>
      <Text style={pdfStyles.sectionTitle}>{title}</Text>
      <Text style={compact ? pdfStyles.compactParagraph : pdfStyles.paragraph}>{text}</Text>
    </View>
  );
}

export function PdfBulletList({ items, compact }: { items: string[]; compact?: boolean }) {
  return (
    <View>
      {items.map((item, index) => (
        <View style={pdfStyles.bulletRow} key={index}>
          <Text style={pdfStyles.bulletMark}>•</Text>
          <Text style={compact ? pdfStyles.compactBulletText : pdfStyles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function PdfFooter({ label }: { label: string }) {
  return (
    <Text style={pdfStyles.footer} fixed>
      {label} · gerado pelo Pregue Melhor
    </Text>
  );
}
