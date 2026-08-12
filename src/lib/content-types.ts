const CONTENT_TYPE_LABELS: Record<string, string> = {
  pregacao: "Pregação Completa",
  biblia_explicada: "Bíblia Explicada",
  esboco_pregacao: "Esboço em Pregação",
  esboco_pulpito: "Esboço para Púlpito",
  devocional: "Devocional",
};

export function getContentTypeLabel(type: string): string {
  return CONTENT_TYPE_LABELS[type] ?? type;
}
