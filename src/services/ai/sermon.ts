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
  "ensino",
  "oracao",
  "evangelistico",
  "jovens",
  "mulheres",
  "homens",
  "santa_ceia",
  "congresso",
  "celula",
  "outro",
] as const;

export const sermonStyles = [
  "expositivo",
  "tematico",
  "evangelistico",
  "ensino_biblico",
  "reflexiva",
] as const;

export const sermonDurations = ["curta", "media", "completa"] as const;

export type SermonInput = {
  themeOrPassage: string;
  audience: (typeof sermonAudiences)[number];
  style: (typeof sermonStyles)[number];
  duration: (typeof sermonDurations)[number];
};

const palavraOriginalSchema = z.object({
  palavra: z
    .string()
    .min(1)
    .describe("A palavra no idioma original, em hebraico (Antigo Testamento) ou grego (Novo Testamento)"),
  idioma: z.enum(["hebraico", "grego"]).describe("Idioma da palavra original"),
  transliteracao: z.string().min(1).describe("Forma de leitura/pronúncia da palavra original"),
  significado: z
    .string()
    .min(1)
    .describe("Significado da palavra no contexto da passagem, em linguagem simples"),
  aplicacao: z
    .string()
    .min(1)
    .describe("Por que essa palavra aprofunda a compreensão deste ponto da mensagem"),
});

const pontoSchema = z.object({
  titulo: z.string().min(1).describe("Título curto do ponto, natural e pregável"),
  explicacao: z
    .string()
    .min(1)
    .describe(
      "Explicação bíblica e pastoral do ponto, em parágrafos curtos separados por uma linha em branco. Direto e sem redundância com os outros pontos.",
    ),
  exemplo_aplicacao: z
    .string()
    .min(1)
    .describe(
      "Aplicação prática curta e objetiva: uma atitude ou decisão concreta que o ouvinte pode tomar a partir deste ponto específico. Direto ao ponto, sem repetir a explicação nem a aplicação de outros pontos.",
    ),
  palavra_original: palavraOriginalSchema
    .nullable()
    .describe(
      "Palavra-chave no idioma original bíblico (hebraico para Antigo Testamento, grego para Novo Testamento) para este ponto, apenas quando genuinamente relevante para a compreensão. Curta e objetiva. Use null quando não houver uma palavra que agregue — não force em todo ponto e nunca invente etimologias, transliterações ou significados.",
    ),
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
    .max(4)
    .describe("Os mesmos pontos da pregação (mesma quantidade), resumidos em tópicos"),
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
  introducao: z
    .string()
    .min(1)
    .describe("Parágrafos curtos separados por linha em branco, sem antecipar o desenvolvimento dos pontos"),
  contexto_biblico: z
    .string()
    .min(1)
    .describe(
      "Pano de fundo histórico/bíblico do texto, em linguagem simples e parágrafos curtos separados por linha em branco",
    ),
  pontos: z
    .array(pontoSchema)
    .min(3)
    .max(4)
    .describe("Três ou quatro pontos principais da pregação, sem sobreposição de conteúdo entre eles"),
  aplicacao_final: z
    .string()
    .min(1)
    .describe(
      "Aplicação geral da mensagem, complementar às aplicações específicas de cada ponto — não repita o que já foi dito neles. Parágrafos curtos.",
    ),
  conclusao: z.string().min(1).describe("Fechamento breve, sem introduzir ideia nova"),
  apelo: z.string().min(1).describe("Curto e direto"),
  oracao_final: z.string().min(1).describe("Curta"),
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
      "Bastante compacta (10 a 15 minutos falados). Introdução de 1 a 2 parágrafos curtos, 3 pontos objetivos com aplicação breve, conclusão e apelo diretos.",
  },
  media: {
    label: "20 a 30 minutos",
    maxOutputTokens: 3072,
    guidance:
      "Compacta (20 a 30 minutos falados). Introdução de 2 parágrafos curtos, 3 pontos com um exemplo ou aplicação prática cada, aplicação geral e conclusão breves.",
  },
  completa: {
    label: "40 a 60 minutos",
    maxOutputTokens: 6000,
    guidance:
      `Aprofundada, mas confortável de ler — isto é MATERIAL DE APOIO para o pregador desenvolver ao vivo por 40 a 60 minutos, não um texto para ser lido literalmente palavra por palavra. Não é um livro. Priorize conteúdo substancial sem redundância: cada seção deve trazer algo que as outras não trazem. Siga estas metas por campo (em parágrafos curtos — poucas frases cada, nunca um bloco único de texto):
- introducao: 3 a 4 parágrafos curtos.
- contexto_biblico: 2 a 3 parágrafos curtos.
- pontos: 3 ou 4 pontos principais.
- cada ponto (explicacao): 3 a 5 parágrafos curtos.
- cada ponto (exemplo_aplicacao): curta e objetiva, 1 parágrafo.
- palavra_original (quando houver): curta e objetiva.
- aplicacao_final: 2 a 3 parágrafos curtos, complementando (não repetindo) as aplicações de cada ponto.
- conclusao: aproximadamente 2 parágrafos curtos.
- apelo: curto, 1 parágrafo.
- oracao_final: curta, 1 parágrafo.
- esboco_pulpito: compacto, só tópicos escaneáveis.
Não empobreça a teologia para reduzir o tamanho — corte redundância, não profundidade.`,
  },
};

const AUDIENCE_LABELS: Record<SermonInput["audience"], string> = {
  domingo: "culto de domingo",
  ensino: "culto de ensino",
  oracao: "culto de oração",
  evangelistico: "culto evangelístico",
  jovens: "culto de jovens",
  mulheres: "culto de mulheres",
  homens: "culto de homens",
  santa_ceia: "culto de Santa Ceia",
  congresso: "congresso ou conferência",
  celula: "célula ou pequeno grupo",
  outro: "outro contexto de ministração",
};

const STYLE_LABELS: Record<SermonInput["style"], string> = {
  expositivo: "expositivo",
  tematico: "temático",
  evangelistico: "evangelístico",
  ensino_biblico: "ensino bíblico",
  reflexiva: "reflexiva",
};

const SYSTEM_INSTRUCTION = `Você ajuda pregadores cristãos a preparar mensagens para o púlpito, em português do Brasil.

Regras de estilo:
- Escreva de forma natural, pastoral e pregável — nunca acadêmica ou rebuscada.
- Nunca use títulos teológicos artificiais. Prefira títulos simples e diretos.
- Seja bíblico, claro e aplicável à vida real do ouvinte.
- Use como base o tema ou passagem informados pelo usuário.
- Adapte vocabulário, exemplos, aplicação e tom ao Estilo e ao Onde vai ministrar informados — uma mensagem para "culto de ensino" com estilo "ensino bíblico" deve ser claramente diferente de uma mensagem para "culto evangelístico" com estilo "evangelístico" (esta última deve incluir convite claro à fé em Cristo; a primeira deve aprofundar o ensino do texto).
- Toda pregação precisa de aplicação prática real em cada ponto — nunca entregue só explicação bíblica.
- "palavra_original": inclua uma palavra em hebraico (Antigo Testamento) ou grego (Novo Testamento) apenas quando ela realmente ajudar a entender o ponto; use null quando não houver uma palavra relevante. Nunca invente etimologias, transliterações ou significados — se não tiver certeza, use null.
- Em todo campo de texto mais longo (introducao, contexto_biblico, explicacao de cada ponto, aplicacao_final, conclusao): escreva em parágrafos curtos (poucas frases cada), separados por uma linha em branco entre eles — nunca um bloco único de texto extenso. Isso é para leitura confortável em celular.
- Evite repetir a mesma ideia, explicação ou aplicação em seções diferentes (introdução, pontos, aplicação final, conclusão) — cada seção deve trazer conteúdo distinto.
- O tempo de duração (ex.: "40 a 60 minutos") representa material de apoio suficiente para o pregador desenvolver ao vivo nesse tempo, não um texto para ser lido literalmente do início ao fim.
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

const rawSermonJsonSchema = z.toJSONSchema(sermonContentSchema, {
  target: "draft-7",
}) as Record<string, unknown>;
delete rawSermonJsonSchema.$schema;
const sermonJsonSchema = rawSermonJsonSchema;

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
