import "server-only";
import { z } from "zod";
import { getGeminiClient } from "./gemini-client";

// Modelo escolhido: gemini-3.1-flash-lite. É o Flash "current" da família
// Lite (não a 2.0/2.5, já superadas), otimizado pelo próprio Google para
// "high-frequency, lightweight tasks" e "low-latency, cost-effective" —
// exatamente o perfil de custo/velocidade que queremos para gerar uma
// pregação estruturada. Ver relatório desta etapa para a comparação de
// custo com os demais modelos Flash disponíveis em ai.google.dev/gemini-api/docs/pricing.
const MODEL = "gemini-3.1-flash-lite";

export const sermonAudiences = [
  "domingo",
  "doutrina",
  "jovens",
  "mulheres",
] as const;

export const sermonStyles = ["expositivo", "tematico", "evangelistico"] as const;

export const sermonDurations = ["curta", "media", "completa"] as const;

export type SermonInput = {
  themeOrPassage: string;
  audience: (typeof sermonAudiences)[number];
  style: (typeof sermonStyles)[number];
  duration: (typeof sermonDurations)[number];
};

const pontoSchema = z.object({
  titulo: z.string().min(1).describe("Título curto do ponto, natural e pregável"),
  explicacao: z.string().min(1).describe("Explicação bíblica e pastoral do ponto"),
  exemplo_aplicacao: z
    .string()
    .min(1)
    .describe("Exemplo ou aplicação prática do ponto para a vida do ouvinte"),
});

const esbocoPontoSchema = z.object({
  titulo: z.string().min(1).describe("Título curto do ponto, para o esboço"),
  itens: z
    .array(z.string().min(1))
    .min(1)
    .max(4)
    .describe("Frases curtas e escaneáveis, para consulta rápida no púlpito"),
});

const esbocoPulpitoSchema = z.object({
  titulo: z.string().min(1),
  texto_base: z.string().min(1),
  pontos: z
    .array(esbocoPontoSchema)
    .min(3)
    .max(3)
    .describe("Os mesmos 3 pontos da pregação, resumidos em tópicos"),
  apelo: z.string().min(1).describe("Frase curta de apelo, para lembrete rápido"),
});

export const sermonContentSchema = z.object({
  titulo: z
    .string()
    .min(1)
    .describe(
      "Título natural e pregável da mensagem, sem jargão acadêmico (ex.: 'O Amor de Deus que nos Alcança', nunca algo como 'O Ápice da Soteriologia Divina')",
    ),
  texto_base: z.string().min(1).describe("Texto base ou passagem bíblica principal"),
  tema_central: z.string().min(1).describe("Uma frase resumindo o tema central"),
  introducao: z.string().min(1),
  contexto_biblico: z
    .string()
    .min(1)
    .describe("Pano de fundo histórico/bíblico do texto, em linguagem simples"),
  pontos: z
    .array(pontoSchema)
    .min(3)
    .max(3)
    .describe("Exatamente três pontos principais da pregação"),
  aplicacao_final: z.string().min(1),
  conclusao: z.string().min(1),
  apelo: z.string().min(1),
  oracao_final: z.string().min(1),
  esboco_pulpito: esbocoPulpitoSchema.describe(
    "Versão resumida e escaneável para uso durante a ministração — não repete a pregação inteira",
  ),
});

export type SermonContent = z.infer<typeof sermonContentSchema>;

export type GenerateSermonResult =
  | { success: true; sermon: SermonContent }
  | { success: false; message: string };

const DURATION_CONFIG: Record<
  SermonInput["duration"],
  { label: string; maxOutputTokens: number; guidance: string }
> = {
  curta: {
    label: "10 a 15 minutos",
    maxOutputTokens: 2048,
    guidance:
      "A pregação deve ser curta e objetiva (10 a 15 minutos falados). Vá direto ao ponto, com poucos exemplos.",
  },
  media: {
    label: "20 a 30 minutos",
    maxOutputTokens: 3072,
    guidance:
      "A pregação deve ter desenvolvimento intermediário (20 a 30 minutos falados), com um exemplo ou aplicação prática por ponto.",
  },
  completa: {
    label: "30 a 40 minutos",
    maxOutputTokens: 4096,
    guidance:
      "A pregação deve ter desenvolvimento mais completo (30 a 40 minutos falados), com mais exemplos e aplicações em cada ponto. Não produza conteúdo para mais de 40 minutos.",
  },
};

const AUDIENCE_LABELS: Record<SermonInput["audience"], string> = {
  domingo: "culto de domingo",
  doutrina: "estudo doutrinário",
  jovens: "culto de jovens",
  mulheres: "culto de mulheres",
};

const STYLE_LABELS: Record<SermonInput["style"], string> = {
  expositivo: "expositivo",
  tematico: "temático",
  evangelistico: "evangelístico",
};

const SYSTEM_INSTRUCTION = `Você ajuda pregadores cristãos a preparar mensagens para o púlpito, em português do Brasil.

Regras de estilo:
- Escreva de forma natural, pastoral e pregável — nunca acadêmica ou rebuscada.
- Nunca use títulos teológicos artificiais. Prefira títulos simples e diretos.
- Seja bíblico, claro e aplicável à vida real do ouvinte.
- Use como base o tema ou passagem informados pelo usuário.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: SermonInput): string {
  const duration = DURATION_CONFIG[input.duration];
  return `Tema ou passagem bíblica: ${input.themeOrPassage}
Onde vai ser ministrada: ${AUDIENCE_LABELS[input.audience]}
Estilo: ${STYLE_LABELS[input.style]}
Duração alvo: ${duration.label}

${duration.guidance}

Gere uma pregação completa e um esboço resumido para o púlpito, seguindo o formato pedido.`;
}

const { $schema: _omit, ...sermonJsonSchema } = z.toJSONSchema(sermonContentSchema, {
  target: "draft-7",
});

export async function generateSermon(
  input: SermonInput,
): Promise<GenerateSermonResult> {
  const start = Date.now();
  let usage = { total_input_tokens: 0, total_output_tokens: 0, total_tokens: 0 };
  let success = false;

  try {
    const client = getGeminiClient();
    const durationSettings = DURATION_CONFIG[input.duration];

    const interaction = await client.interactions.create({
      model: MODEL,
      store: false,
      system_instruction: SYSTEM_INSTRUCTION,
      input: buildPrompt(input),
      generation_config: {
        max_output_tokens: durationSettings.maxOutputTokens,
      },
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: sermonJsonSchema,
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
    const parsed = sermonContentSchema.safeParse(raw);

    if (!parsed.success) {
      console.error(
        "[AI-LOG] tool=pregacao validation_error=" + parsed.error.message,
      );
      return {
        success: false,
        message: "A IA retornou uma resposta em formato inesperado. Tente novamente.",
      };
    }

    success = true;
    return { success: true, sermon: parsed.data };
  } catch (error) {
    console.error("Falha ao gerar pregação:", error);
    return {
      success: false,
      message: "Não foi possível gerar a pregação agora. Tente novamente.",
    };
  } finally {
    const latencyMs = Date.now() - start;
    console.log(
      `[AI-LOG] tool=pregacao model=${MODEL} duration=${input.duration} input_tokens=${usage.total_input_tokens} output_tokens=${usage.total_output_tokens} total_tokens=${usage.total_tokens} latency_ms=${latencyMs} success=${success}`,
    );
  }
}
