import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";

export const devotionalMoments = ["manha", "noite", "qualquer"] as const;
export type DevotionalMoment = (typeof devotionalMoments)[number];

// O usuário não informa tema nem passagem — a IA escolhe sozinha,
// variando entre gerações. Sem input textual nenhum.
export type DevotionalInput = {
  moment: DevotionalMoment;
};

export const devotionalContentSchema = z.object({
  titulo: z.string().min(1).describe("Título curto e acolhedor, sem jargão"),
  texto_base: z
    .string()
    .min(1)
    .describe("Texto base ou passagem bíblica relacionada ao tema"),
  reflexao: z
    .string()
    .min(1)
    .describe(
      "Reflexão curta conectando a verdade do texto com a vida real — não é uma pregação com pontos",
    ),
  aplicacao: z.string().min(1).describe("Aplicação prática e concreta para hoje"),
  oracao: z.string().min(1).describe("Oração curta e natural, de 4 a 6 linhas"),
  versiculo_para_guardar: z
    .string()
    .min(1)
    .describe(
      "Um versículo bíblico real relacionado ao tema, com a referência correta, no formato 'texto do versículo — Referência'",
    ),
});

export type DevotionalContent = z.infer<typeof devotionalContentSchema>;

const MOMENT_CONFIG: Record<DevotionalMoment, { label: string; guidance: string }> = {
  manha: {
    label: "manhã",
    guidance:
      "Tom para a manhã: direção, confiança, entrega do dia a Deus, propósito. Pode mencionar 'esta manhã' no máximo uma vez, de forma natural — não repita isso o tempo todo.",
  },
  noite: {
    label: "noite",
    guidance:
      "Tom para a noite: descanso, gratidão pelo dia, reflexão, entrega das preocupações antes de dormir. Pode mencionar 'esta noite' no máximo uma vez, de forma natural — não repita isso o tempo todo.",
  },
  qualquer: {
    label: "qualquer momento do dia",
    guidance: "Tom neutro, que funcione a qualquer hora do dia — não mencione um momento específico.",
  },
};

const SYSTEM_INSTRUCTION = `Você escreve devocionais cristãos curtos e diários, em português do Brasil — não uma pregação, não um estudo acadêmico.

Regras:
- O usuário NÃO informa tema nem passagem: escolha você mesmo uma passagem bíblica real e um tema cristão prático, com boa variedade entre gerações diferentes — não se limite sempre aos mesmos livros, capítulos ou temas.
- Varie entre temas como: fé, esperança, gratidão, ansiedade, oração, paz, perdão, perseverança, sabedoria, obediência, amor, descanso em Deus, coragem — entre outros temas cristãos práticos.
- Curto: a resposta inteira deve ficar entre 300 e 500 palavras no total. Não ultrapasse isso desnecessariamente.
- Linguagem pastoral, simples, acolhedora, bíblica, natural e prática.
- Nunca use termos acadêmicos, grego/hebraico, ou jargão teológico pesado (ex.: nunca escreva algo como "O Ápice da Soteriologia").
- Nunca use frases motivacionais genéricas nem linguagem robótica.
- "reflexao": explique a verdade principal do texto conectando com a vida real, de forma curta — nunca vire uma pregação com pontos.
- "aplicacao": traga uma atitude, decisão ou pequena ação concreta para hoje — nunca uma lista extensa.
- "oracao": curta e natural, de 4 a 6 linhas, sem formalismo excessivo.
- "versiculo_para_guardar": um versículo bíblico real relacionado ao tema, com a referência correta. Nunca invente uma referência que não existe.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: DevotionalInput): string {
  const moment = MOMENT_CONFIG[input.moment];
  return `Momento: ${moment.label}

${moment.guidance}

Escreva um devocional curto para esse momento, seguindo exatamente o formato pedido.`;
}

// Meta de 300–500 palavras: 900 tokens de saída é uma margem econômica
// e confortável para isso em português (ver relatório desta etapa).
const MAX_OUTPUT_TOKENS = 900;

const devotionalJsonSchema = toGeminiJsonSchema(devotionalContentSchema);

export async function generateDevotional(
  input: DevotionalInput,
): Promise<GenerateStructuredResult<DevotionalContent>> {
  return generateStructured({
    tool: "devocional",
    logDuration: input.moment,
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    schema: devotionalContentSchema,
    jsonSchema: devotionalJsonSchema,
  });
}
