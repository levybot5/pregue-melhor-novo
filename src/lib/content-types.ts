const CONTENT_TYPE_LABELS: Record<string, string> = {
  pregacao: "Pregação Completa",
  biblia_explicada: "Bíblia Explicada",
  esboco_pregacao: "Esboço em Pregação",
  esboco_pulpito: "Pregação para Esboço",
  devocional: "Devocional",
  aula_biblica: "Aula Bíblica",
};

export function getContentTypeLabel(type: string): string {
  return CONTENT_TYPE_LABELS[type] ?? type;
}
