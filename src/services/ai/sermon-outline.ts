import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";

// Pregação para Esboço: NÃO cria uma pregação nova. Recebe uma
// pregação que o pastor já escreveu (colada pelo usuário) e a
// condensa num esboço para consulta rápida no púlpito, preservando a
// estrutura e a mensagem originais.

export const sermonOutlineSummaryLevels = ["enxuto", "equilibrado", "detalhado"] as const;
export type SermonOutlineSummaryLevel = (typeof sermonOutlineSummaryLevels)[number];

export type SermonOutlineInput = {
  sermonText: string;
  level: SermonOutlineSummaryLevel;
};

const outlinePointSchema = z.object({
  titulo: z.string().min(1).describe("Título do ponto, extraído ou identificado a partir do texto original"),
  referencias: z
    .array(z.string().min(1))
    .describe("Referências bíblicas citadas neste ponto no texto original; array vazio se não houver"),
  bullets: z
    .array(z.string().min(1))
    .min(1)
    .describe("Ideias essenciais do ponto, em tópicos curtos e escaneáveis, extraídas do texto original"),
  frase_chave: z
    .string()
    .nullable()
    .describe(
      "Frase marcante já presente no texto original para este ponto, se houver uma clara. Use null se não houver — nunca invente uma frase que não esteja no texto.",
    ),
  aplicacao: z
    .string()
    .nullable()
    .describe(
      "Aplicação prática deste ponto, condensada em 1 a 2 frases curtas, com base no que já está no texto original. Use null se o texto original não trouxer aplicação para este ponto.",
    ),
});

export const sermonOutlineContentSchema = z.object({
  titulo: z.string().min(1).describe("Título da pregação, extraído do texto original"),
  texto_base: z
    .string()
    .nullable()
    .describe("Texto base ou passagem bíblica principal, se identificável no texto original; use null se não houver"),
  ideia_central: z
    .string()
    .min(1)
    .describe("Uma frase resumindo a ideia central da pregação original"),
  introducao: z
    .array(z.string().min(1))
    .describe("Pontos-chave da introdução original, em tópicos curtos; array vazio se a pregação não tiver introdução clara"),
  pontos: z
    .array(outlinePointSchema)
    .min(1)
    .max(8)
    .describe(
      "Os pontos principais da pregação original, na MESMA QUANTIDADE que o texto original tiver — nunca force um número fixo (nem sempre 3). Se o texto não tiver pontos explícitos, organize o raciocínio em pontos lógicos sem alterar o sentido.",
    ),
  conclusao: z
    .array(z.string().min(1))
    .describe("Pontos-chave da conclusão original, em tópicos curtos; array vazio se não houver conclusão clara"),
  apelo: z
    .string()
    .nullable()
    .describe("Apelo ou chamado final, se houver um no texto original; use null se não houver"),
});

export type SermonOutlineContent = z.infer<typeof sermonOutlineContentSchema>;

const LEVEL_LABELS: Record<SermonOutlineSummaryLevel, string> = {
  enxuto: "Enxuto",
  equilibrado: "Equilibrado",
  detalhado: "Detalhado",
};

const LEVEL_CONFIG: Record<SermonOutlineSummaryLevel, { maxOutputTokens: number; guidance: string }> = {
  enxuto: {
    maxOutputTokens: 1536,
    guidance:
      "Nível ENXUTO: só o essencial para consulta rapidíssima no púlpito. Bullets mínimos e diretos por ponto (2 a 3). Frase-chave e aplicação só se forem muito curtas e realmente essenciais — na dúvida, use null.",
  },
  equilibrado: {
    maxOutputTokens: 2560,
    guidance:
      "Nível EQUILIBRADO: pontos com bullets essenciais (3 a 5), referências bíblicas, frase-chave quando existir no original, e aplicação condensada em 1 a 2 frases por ponto.",
  },
  detalhado: {
    maxOutputTokens: 3584,
    guidance:
      "Nível DETALHADO: um pouco mais de apoio em cada ponto (até 6 bullets), mas ainda um esboço escaneável — nunca parágrafos longos nem texto corrido. Continue muito menor que a pregação original.",
  },
};

const SYSTEM_INSTRUCTION = `Você receberá uma pregação já escrita por um pastor, em português do Brasil.

Sua tarefa NÃO é escrever uma nova pregação. Sua tarefa é transformar o conteúdo fornecido em um esboço para consulta durante a ministração.

Regras centrais:
- Preserve fielmente a mensagem, a interpretação bíblica, a linha de raciocínio e as aplicações do autor.
- Não acrescente novas doutrinas, histórias, ilustrações, interpretações ou argumentos que não estejam presentes no texto original.
- Nunca invente versículos, referências, frases ou aplicações que não estejam no texto original — use null ou array vazio quando a informação não existir.
- Remova redundâncias e detalhes que não sejam necessários para consulta rápida no púlpito.
- Identifique a estrutura real da mensagem (quantidade real de pontos) em vez de forçar uma estrutura artificial de 3 pontos. Se o texto não tiver pontos explicitamente definidos, organize o raciocínio em pontos lógicos, sem alterar o sentido original.
- Se o texto original mencionar uma palavra no idioma original (hebraico/grego) relevante, pode incluir isso como um bullet curto dentro do ponto correspondente — não desenvolva uma explicação longa sobre ela.
- Frases curtas, bullets, nunca parágrafos longos ou explicações acadêmicas.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: SermonOutlineInput): string {
  const level = LEVEL_CONFIG[input.level];
  return `Pregação original (colada pelo usuário):

"""
${input.sermonText}
"""

Nível de resumo: ${LEVEL_LABELS[input.level]}

${level.guidance}

Transforme essa pregação em um esboço para consulta no púlpito, seguindo exatamente o formato pedido.`;
}

const sermonOutlineJsonSchema = toGeminiJsonSchema(sermonOutlineContentSchema);

export async function condenseSermonOutline(
  input: SermonOutlineInput,
): Promise<GenerateStructuredResult<SermonOutlineContent>> {
  const levelSettings = LEVEL_CONFIG[input.level];

  return generateStructured({
    tool: "esboco_pulpito",
    logDuration: input.level,
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: levelSettings.maxOutputTokens,
    schema: sermonOutlineContentSchema,
    jsonSchema: sermonOutlineJsonSchema,
  });
}
