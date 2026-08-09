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

export type OutlineExpansionInput = {
  outline: string;
  audience: MinistryAudience;
  style: MinistryStyle;
  duration: MinistryDuration;
};

const pointSchema = z.object({
  titulo: z.string().min(1).describe("Título do ponto, natural e pregável"),
  explicacao: z
    .string()
    .min(1)
    .describe("Desenvolvimento do ponto, respeitando a ideia do esboço original"),
  exemplo_aplicacao: z.string().min(1).describe("Exemplo ou aplicação prática do ponto"),
});

const outlinePointSchema = z.object({
  titulo: z.string().min(1),
  itens: z
    .array(z.string().min(1))
    .min(1)
    .max(4)
    .describe("Frases curtas e escaneáveis, para consulta rápida no púlpito"),
});

const summaryOutlineSchema = z.object({
  titulo: z.string().min(1),
  texto_base: z.string().min(1),
  pontos: z
    .array(outlinePointSchema)
    .min(1)
    .max(7)
    .describe("Mesma quantidade de pontos da pregação desenvolvida, resumidos em tópicos"),
  apelo: z.string().min(1).describe("Frase curta de apelo, para lembrete rápido"),
});

export const outlineExpansionContentSchema = z.object({
  titulo: z.string().min(1).describe("Título natural e pregável, sem jargão acadêmico"),
  texto_base: z.string().min(1),
  ideia_central: z.string().min(1),
  introducao: z.string().min(1),
  contexto: z
    .string()
    .nullable()
    .describe(
      "Contexto bíblico/histórico, apenas se necessário para entender o esboço; use null se não for necessário",
    ),
  pontos: z
    .array(pointSchema)
    .min(1)
    .max(7)
    .describe(
      "Desenvolva os pontos do esboço original. Preserve a quantidade e a lógica que o usuário trouxe — não force exatamente 3 pontos se isso destruir o esboço.",
    ),
  aplicacoes: z.string().min(1),
  conclusao: z.string().min(1),
  apelo: z.string().min(1),
  oracao: z.string().min(1),
  esboco_pulpito: summaryOutlineSchema.describe(
    "Versão resumida e escaneável para uso durante a ministração — não repete a pregação inteira",
  ),
});

export type OutlineExpansionContent = z.infer<typeof outlineExpansionContentSchema>;

const DURATION_CONFIG: Record<MinistryDuration, { maxOutputTokens: number; guidance: string }> = {
  curta: {
    maxOutputTokens: 2048,
    guidance:
      "A pregação deve ser curta e objetiva (10 a 15 minutos falados). Vá direto ao ponto, com poucos exemplos.",
  },
  media: {
    maxOutputTokens: 3072,
    guidance:
      "A pregação deve ter desenvolvimento intermediário (20 a 30 minutos falados), com um exemplo ou aplicação prática por ponto.",
  },
  completa: {
    maxOutputTokens: 4096,
    guidance:
      "A pregação deve ter desenvolvimento mais completo (30 a 40 minutos falados), com mais exemplos e aplicações em cada ponto. Não produza conteúdo para mais de 40 minutos.",
  },
};

const SYSTEM_INSTRUCTION = `Você ajuda pregadores a transformar um esboço simples em uma pregação desenvolvida e pregável, em português do Brasil.

Regras:
- Respeite o esboço fornecido pelo usuário: desenvolva a ideia central e os pontos que ele trouxe. Não substitua por outra pregação nem mude o tema.
- Preserve a quantidade e a ordem dos pontos do esboço original sempre que fizer sentido — não force exatamente 3 pontos.
- Escreva de forma natural, pastoral e pregável — nunca acadêmica.
- Nunca use títulos teológicos artificiais.
- "contexto": inclua apenas se necessário para entender o esboço; caso contrário, retorne null.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: OutlineExpansionInput): string {
  const duration = DURATION_CONFIG[input.duration];
  return `Esboço fornecido pelo usuário:
"""
${input.outline}
"""

Onde vai ser ministrada: ${AUDIENCE_LABELS[input.audience]}
Estilo: ${STYLE_LABELS[input.style]}
Duração alvo: ${DURATION_LABELS[input.duration]}

${duration.guidance}

Desenvolva esse esboço em uma pregação completa e pregável, respeitando a ideia central e a estrutura original, e gere também um esboço resumido para o púlpito.`;
}

const outlineExpansionJsonSchema = toGeminiJsonSchema(outlineExpansionContentSchema);

export async function expandOutline(
  input: OutlineExpansionInput,
): Promise<GenerateStructuredResult<OutlineExpansionContent>> {
  const durationSettings = DURATION_CONFIG[input.duration];

  return generateStructured({
    tool: "esboco_pregacao",
    logDuration: input.duration,
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: durationSettings.maxOutputTokens,
    schema: outlineExpansionContentSchema,
    jsonSchema: outlineExpansionJsonSchema,
  });
}
