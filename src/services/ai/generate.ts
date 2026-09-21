import "server-only";
import { z } from "zod";
import { getGeminiClient } from "./gemini-client";

// Mesmo modelo validado na Etapa 3, para todas as ferramentas — não
// trocar aqui sem medir custo/qualidade primeiro (ver relatório).
export const MODEL = "gemini-3.1-flash-lite";

// Achado real (usuário reportou "dEle" num texto gerado): o modelo às
// vezes tenta maiúscula reverencial em pronomes que se referem a Deus
// (comum em texto cristão em português) só que de forma gramaticalmente
// errada, com uma letra maiúscula isolada no meio da palavra. Anexado
// a TODO system_instruction aqui (não em cada ferramenta individual)
// pra corrigir de uma vez só, em qualquer lugar que isso apareça.
const SHARED_STYLE_RULES = `

Se usar maiúscula reverencial em pronomes que se referem a Deus, Jesus ou o Espírito Santo (Ele, Nele, Dele, Seu, Teu), capitalize a palavra inteira corretamente (ex.: "Ele", "Nele", "Dele") — nunca uma letra maiúscula isolada no meio da palavra (nunca "dEle", "nEle", "sEu"). Usar essa maiúscula é opcional, não é obrigatório em todo pronome, mas se usar, use certo.`;

// Rede de segurança pro mesmo problema (a instrução acima no prompt
// não é suficiente sozinha — testado ao vivo, o modelo continua
// errando às vezes): corrige "dEle"/"nEle"/"sEu"/"tEu" pra
// "Dele"/"Nele"/"Seu"/"Teu" em QUALQUER string do resultado, recursivo
// (objetos e arrays), depois que a resposta já passou pela validação
// Zod. Só bate no padrão quebrado (prefixo minúsculo colado a "Ele"/
// "Eu" com E maiúsculo) — nunca toca "ele"/"eu" já minúsculos nem
// "Ele"/"Dele" já corretos, então nunca muda o sentido do texto.
const BROKEN_REVERENTIAL_CAPITALIZATION = /\b[a-zà-ÿ]+(?:Ele|Eu)\b/g;

function fixReverentialCapitalization<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(
      BROKEN_REVERENTIAL_CAPITALIZATION,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase(),
    ) as T;
  }
  if (Array.isArray(value)) {
    return value.map(fixReverentialCapitalization) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, fixReverentialCapitalization(v)]),
    ) as T;
  }
  return value;
}

export type GenerateStructuredResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

type GenerateStructuredParams<T> = {
  tool: string;
  // Rótulo para o campo duration= do [AI-LOG]. Pode ser "n/a" para
  // ferramentas sem duração (ex.: Bíblia Explicada).
  logDuration: string;
  systemInstruction: string;
  input: string;
  maxOutputTokens: number;
  schema: z.ZodType<T>;
  jsonSchema: Record<string, unknown>;
};

// Núcleo único de chamada ao provedor de IA, reutilizado por todas as
// ferramentas estruturadas: 1 chamada por invocação, sem retry
// automático, validação Zod da resposta antes de considerar sucesso,
// e log [AI-LOG] padronizado (nunca loga o conteúdo gerado).
export async function generateStructured<T>({
  tool,
  logDuration,
  systemInstruction,
  input,
  maxOutputTokens,
  schema,
  jsonSchema,
}: GenerateStructuredParams<T>): Promise<GenerateStructuredResult<T>> {
  const start = Date.now();
  let usage = { total_input_tokens: 0, total_output_tokens: 0, total_tokens: 0 };
  let success = false;

  try {
    const client = getGeminiClient();

    const interaction = await client.interactions.create({
      model: MODEL,
      store: false,
      system_instruction: systemInstruction + SHARED_STYLE_RULES,
      input,
      generation_config: { max_output_tokens: maxOutputTokens },
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: jsonSchema,
      },
    });

    usage = {
      total_input_tokens: interaction.usage?.total_input_tokens ?? 0,
      total_output_tokens: interaction.usage?.total_output_tokens ?? 0,
      total_tokens: interaction.usage?.total_tokens ?? 0,
    };

    if (interaction.status !== "completed") {
      throw new Error(
        `Interação não concluída (status: ${interaction.status}) ${JSON.stringify(interaction.errors ?? [])}`,
      );
    }

    const raw = JSON.parse(interaction.output_text ?? "");
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      console.error(`[AI-LOG] tool=${tool} validation_error=` + parsed.error.message);
      return {
        success: false,
        message: "A IA retornou uma resposta em formato inesperado. Tente novamente.",
      };
    }

    success = true;
    return { success: true, data: fixReverentialCapitalization(parsed.data) };
  } catch (error) {
    console.error(`Falha ao gerar (${tool}):`, error);
    return {
      success: false,
      message: "Não foi possível gerar agora. Tente novamente.",
    };
  } finally {
    const latencyMs = Date.now() - start;
    console.log(
      `[AI-LOG] tool=${tool} model=${MODEL} duration=${logDuration} input_tokens=${usage.total_input_tokens} output_tokens=${usage.total_output_tokens} total_tokens=${usage.total_tokens} latency_ms=${latencyMs} success=${success}`,
    );
  }
}

export function toGeminiJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const raw = z.toJSONSchema(schema, { target: "draft-7" }) as Record<string, unknown>;
  delete raw.$schema;
  return raw;
}
