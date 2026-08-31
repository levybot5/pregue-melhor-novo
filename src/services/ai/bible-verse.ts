import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";

export type BibleVerseExplanationInput = {
  reference: string; // ex.: "João 3:16"
  text: string; // texto do versículo já salvo em bible_verses — nunca gerado pela IA
};

const originalWordSchema = z.object({
  termo: z.string().min(1).describe("A palavra no idioma original (hebraico ou grego)"),
  idioma: z.enum(["hebraico", "grego"]),
  transliteracao: z.string().nullable(),
  significado: z.string().min(1).describe("Significado da palavra, em linguagem simples"),
});

export const bibleVerseExplanationSchema = z.object({
  contexto: z
    .string()
    .min(1)
    .describe(
      "Uma ou duas frases curtas de contexto (quem fala, pra quem, situação do momento) — só o essencial pra entender este versículo específico.",
    ),
  explicacao: z
    .string()
    .min(1)
    .describe("O sentido do versículo em linguagem simples e pastoral, 2-4 frases curtas."),
  palavra_original: originalWordSchema
    .nullable()
    .describe("No máximo uma palavra no original, só se genuinamente agregar. Use null quando não houver valor real."),
  aplicacao: z
    .string()
    .min(1)
    .describe("Uma aplicação prática curta e concreta, nascida deste versículo específico."),
});

export type BibleVerseExplanation = z.infer<typeof bibleVerseExplanationSchema>;

const SYSTEM_INSTRUCTION = `Você explica um único versículo bíblico por vez, em português do Brasil, de forma pastoral, simples e bem curta — isto aparece dentro de um leitor de Bíblia, ao lado do próprio texto do versículo, não é um estudo completo.

Regras:
- Seja breve em cada campo — poucas frases. Isto é uma explicação rápida ao toque, não um artigo.
- Nunca repita o texto do versículo de volta — a pessoa já está vendo ele na tela.
- Nunca use termos técnicos de teologia acadêmica.
- "palavra_original": só quando genuinamente relevante pra este versículo específico; use null na maioria das vezes.
- "aplicacao": concreta e ligada exatamente a este versículo, nunca genérica.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: BibleVerseExplanationInput): string {
  return `Referência: ${input.reference}
Texto do versículo (ACF): ${input.text}

Explique este versículo especificamente, seguindo o formato pedido.`;
}

// Explicação curta — bem mais barata que Bíblia Explicada (que cobre
// uma passagem inteira), por isso o teto de tokens é bem menor.
const MAX_OUTPUT_TOKENS = 500;
const bibleVerseExplanationJsonSchema = toGeminiJsonSchema(bibleVerseExplanationSchema);

export async function generateVerseExplanation(
  input: BibleVerseExplanationInput,
): Promise<GenerateStructuredResult<BibleVerseExplanation>> {
  return generateStructured({
    tool: "biblia_versiculo",
    logDuration: "n/a",
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    schema: bibleVerseExplanationSchema,
    jsonSchema: bibleVerseExplanationJsonSchema,
  });
}
