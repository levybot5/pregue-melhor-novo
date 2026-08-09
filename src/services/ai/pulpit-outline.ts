import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";
import {
  AUDIENCE_LABELS,
  DURATION_LABELS,
  STYLE_LABELS,
  type MinistryAudience,
  type MinistryDuration,
  type MinistryStyle,
} from "./ministry-options";

export type PulpitOutlineInput = {
  themeOrPassage: string;
  audience: MinistryAudience;
  style: MinistryStyle;
  duration: MinistryDuration;
};

const pulpitPointSchema = z.object({
  titulo: z.string().min(1),
  texto_relacionado: z
    .string()
    .min(1)
    .describe("Texto ou referência bíblica relacionada a este ponto"),
  bullets: z
    .array(z.string().min(1))
    .length(3)
    .describe("Exatamente três marcadores curtos e escaneáveis"),
  frase_impacto: z
    .string()
    .min(1)
    .describe("Uma frase curta e marcante para dizer em voz alta neste ponto"),
});

export const pulpitOutlineContentSchema = z.object({
  tema: z.string().min(1),
  texto_base: z.string().min(1),
  ideia_central: z.string().min(1),
  introducao: z
    .array(z.string().min(1))
    .min(1)
    .max(3)
    .describe("Até 3 marcadores curtos de introdução"),
  pontos: z
    .array(pulpitPointSchema)
    .length(3)
    .describe("Exatamente três pontos, cada um com bullets e frase de impacto"),
  aplicacao_final: z
    .array(z.string().min(1))
    .min(1)
    .max(3)
    .describe("Até 3 marcadores de aplicação final"),
  apelo: z.string().min(1).describe("Curto e direto"),
  oracao: z.string().min(1).describe("Curta"),
});

export type PulpitOutlineContent = z.infer<typeof pulpitOutlineContentSchema>;

const DURATION_CONFIG: Record<MinistryDuration, { maxOutputTokens: number; guidance: string }> = {
  curta: {
    maxOutputTokens: 768,
    guidance: "Roteiro enxuto, para 10 a 15 minutos de pregação.",
  },
  media: {
    maxOutputTokens: 1024,
    guidance: "Roteiro para 20 a 30 minutos de pregação.",
  },
  completa: {
    maxOutputTokens: 1280,
    guidance:
      "Roteiro para 30 a 40 minutos de pregação, com um pouco mais de detalhe em cada bullet — mas ainda escaneável, nunca um texto corrido.",
  },
};

const SYSTEM_INSTRUCTION = `Você cria roteiros resumidos e escaneáveis para pregadores usarem DURANTE a ministração, em português do Brasil — um roteiro de apoio visual, não uma pregação completa.

Regras:
- Seja extremamente conciso: frases curtas e bullets, nunca parágrafos longos.
- Cada bullet deve ser útil e específico — não vale ser genérico demais nem virar só "1. 2. 3." sem conteúdo real.
- Nunca use títulos teológicos artificiais.
- Isto NÃO é uma pregação completa — não escreva explicações longas em prosa.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: PulpitOutlineInput): string {
  const duration = DURATION_CONFIG[input.duration];
  return `Tema ou passagem bíblica: ${input.themeOrPassage}
Onde vai ser ministrada: ${AUDIENCE_LABELS[input.audience]}
Estilo: ${STYLE_LABELS[input.style]}
Duração alvo: ${DURATION_LABELS[input.duration]}

${duration.guidance}

Gere um roteiro escaneável para o púlpito, seguindo exatamente o formato pedido: nada de parágrafos, só tópicos curtos e úteis.`;
}

const pulpitOutlineJsonSchema = toGeminiJsonSchema(pulpitOutlineContentSchema);

export async function generatePulpitOutline(
  input: PulpitOutlineInput,
): Promise<GenerateStructuredResult<PulpitOutlineContent>> {
  const durationSettings = DURATION_CONFIG[input.duration];

  return generateStructured({
    tool: "esboco_pulpito",
    logDuration: input.duration,
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: durationSettings.maxOutputTokens,
    schema: pulpitOutlineContentSchema,
    jsonSchema: pulpitOutlineJsonSchema,
  });
}
