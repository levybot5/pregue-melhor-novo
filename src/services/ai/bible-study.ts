import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";

export type BibleStudyInput = {
  passage: string;
};

const originalWordSchema = z.object({
  palavra: z.string().min(1).describe("A palavra no idioma original (hebraico/grego), transliterada"),
  significado: z
    .string()
    .min(1)
    .describe("O que essa palavra significa e por que ajuda a entender o texto, em linguagem simples"),
});

const connectionSchema = z.object({
  referencia: z.string().min(1).describe("Referência bíblica da conexão, ex.: 'Romanos 5:8'"),
  explicacao: z.string().min(1).describe("Como essa passagem se conecta com o texto principal"),
});

export const bibleStudyContentSchema = z.object({
  titulo: z.string().min(1).describe("Título natural e pastoral, sem jargão acadêmico"),
  passagem: z.string().min(1),
  verdade_principal: z.string().min(1).describe("Uma frase com a verdade central da passagem"),
  contexto_biblico: z
    .string()
    .min(1)
    .describe("Pano de fundo histórico/literário do texto, em linguagem simples"),
  explicacao_texto: z
    .string()
    .min(1)
    .describe("Explicação prática do que o texto diz, sem análise gramatical complexa"),
  palavra_original: originalWordSchema
    .nullable()
    .describe(
      "No máximo uma palavra no idioma original, e somente se realmente ajudar a entender o texto. Use null se não for necessária.",
    ),
  conexoes_biblicas: z
    .array(connectionSchema)
    .length(2)
    .describe("Exatamente duas conexões com outras passagens bíblicas"),
  aplicacao_vida_crista: z.string().min(1),
  cuidado_interpretacao: z
    .string()
    .min(1)
    .describe("Um alerta pastoral sobre um erro comum de interpretação desse texto"),
  resumo_final: z.string().min(1),
});

export type BibleStudyContent = z.infer<typeof bibleStudyContentSchema>;

const SYSTEM_INSTRUCTION = `Você ajuda cristãos comuns (não teólogos) a entender uma passagem bíblica específica, em português do Brasil, de forma pastoral e prática — como um estudo bíblico, não um artigo acadêmico e não uma pregação.

Regras:
- Nunca use termos técnicos de teologia acadêmica (ex.: aoristo, homoousios, soteriologia) nem análise gramatical complexa.
- Não escreva um artigo longo — seja claro, direto e prático.
- "palavra_original": inclua apenas se realmente ajudar a entender o texto; caso contrário, retorne null. No máximo uma palavra.
- "conexoes_biblicas": exatamente duas conexões com outras passagens.
- Isto NÃO é uma pregação — não estruture como sermão com pontos numerados.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: BibleStudyInput): string {
  return `Passagem bíblica: ${input.passage}

Explique essa passagem de forma clara, pastoral e prática, seguindo o formato pedido.`;
}

const MAX_OUTPUT_TOKENS = 1500;
const bibleStudyJsonSchema = toGeminiJsonSchema(bibleStudyContentSchema);

export async function generateBibleStudy(
  input: BibleStudyInput,
): Promise<GenerateStructuredResult<BibleStudyContent>> {
  return generateStructured({
    tool: "biblia",
    logDuration: "n/a",
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    schema: bibleStudyContentSchema,
    jsonSchema: bibleStudyJsonSchema,
  });
}
