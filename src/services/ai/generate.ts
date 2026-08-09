import "server-only";
import { z } from "zod";
import { getGeminiClient } from "./gemini-client";

// Mesmo modelo validado na Etapa 3, para todas as ferramentas — não
// trocar aqui sem medir custo/qualidade primeiro (ver relatório).
export const MODEL = "gemini-3.1-flash-lite";

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
      system_instruction: systemInstruction,
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
    return { success: true, data: parsed.data };
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
