// Opções de contexto de ministração, compartilhadas pelas ferramentas
// desta etapa (Esboço em Pregação e Esboço para Púlpito). Pregação
// Completa (sermon.ts) mantém sua própria cópia local — não foi
// tocada nesta etapa, por instrução explícita de não refatorar o que
// já está validado.

export const ministryAudiences = ["domingo", "doutrina", "jovens", "mulheres"] as const;
export const ministryStyles = ["expositivo", "tematico", "evangelistico"] as const;
export const ministryDurations = ["curta", "media", "completa"] as const;

export type MinistryAudience = (typeof ministryAudiences)[number];
export type MinistryStyle = (typeof ministryStyles)[number];
export type MinistryDuration = (typeof ministryDurations)[number];

export const AUDIENCE_LABELS: Record<MinistryAudience, string> = {
  domingo: "culto de domingo",
  doutrina: "estudo doutrinário",
  jovens: "culto de jovens",
  mulheres: "culto de mulheres",
};

export const STYLE_LABELS: Record<MinistryStyle, string> = {
  expositivo: "expositivo",
  tematico: "temático",
  evangelistico: "evangelístico",
};

export const DURATION_LABELS: Record<MinistryDuration, string> = {
  curta: "10 a 15 minutos",
  media: "20 a 30 minutos",
  completa: "30 a 40 minutos",
};
