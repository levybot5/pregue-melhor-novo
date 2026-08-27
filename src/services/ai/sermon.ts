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

// "Formato da Mensagem" — só a abordagem estrutural/exegética
// (COMO a mensagem é construída). Antes se chamava "Tipo de Mensagem"
// e misturava formato com público (Culto de Jovens, Mulheres, Homens,
// Escola Bíblica...), causando opções repetidas com o campo Público.
// Cada eixo agora cobre uma coisa só: Formato (como), Público (pra
// quem), Estilo (com que tom). Situações específicas (ex.: "culto de
// missões", "reunião de líderes") vão em Observações adicionais.
export const sermonFormats = [
  "expositiva",
  "tematica",
  "textual",
  "evangelistica",
  "doutrinaria",
] as const;

// "Público" — pra quem é a mensagem. Padrão: igreja em geral.
export const sermonAudiences = [
  "geral",
  "jovens",
  "adolescentes",
  "criancas",
  "mulheres",
  "homens",
  "lideres",
  "obreiros",
] as const;

// Minutos falados, não mais "curta/média/completa" — mais preciso pro
// pregador escolher (item 5 do pedido).
export const sermonDurations = ["15", "30", "45", "60"] as const;

// "Estilo" — só linguagem/abordagem/tom/aplicação, nunca fidelidade
// bíblica (item 6). Substitui o antigo sermonStyles
// (expositivo/temático/evangelístico/...), que na prática duplicava o
// que "Tipo de Mensagem" passou a cobrir.
export const sermonStyles = [
  "simples",
  "ensino",
  "reflexivo",
  "impactante",
  "pastoral",
  "devocional",
] as const;

// "Profundidade" — nível de análise (contexto, precisão conceitual,
// relações do texto), não tamanho do texto (isso é papel da Duração).
// Padrão: intermediária (item 7).
export const sermonDepths = ["basica", "intermediaria", "profunda", "teologica"] as const;

// "Versão da Bíblia" — preferência de registro/linguagem para
// referências e citações, nunca instrução para reproduzir extensamente
// o texto literal de uma tradução com direitos autorais (item 11: o
// texto_base sempre foi gerado pela própria IA a partir do que ela sabe,
// nunca copiado de uma base de dados de traduções bíblicas — não existe
// esse acervo no projeto). "padrao" = sem preferência, a IA decide.
export const bibleVersions = ["padrao", "ara", "arc", "naa", "nvi", "ntlh", "acf"] as const;

export type SermonInput = {
  passage: string;
  theme: string;
  format: (typeof sermonFormats)[number] | null;
  audience: (typeof sermonAudiences)[number];
  duration: (typeof sermonDurations)[number];
  style: (typeof sermonStyles)[number];
  depth: (typeof sermonDepths)[number];
  bibleVersion: (typeof bibleVersions)[number];
  notes: string;
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

// Duração agora controla SÓ volume/desenvolvimento de conteúdo —
// Profundidade (mais abaixo) controla o nível de análise, são eixos
// independentes (item 5/7 do pedido: não confundir "mais longo" com
// "mais profundo").
const DURATION_CONFIG: Record<
  SermonInput["duration"],
  { label: string; maxOutputTokens: number; guidance: string }
> = {
  "15": {
    label: "15 minutos",
    maxOutputTokens: 2200,
    guidance:
      "Compacta (15 minutos falados). Introdução de 1 parágrafo curto, 3 pontos objetivos com aplicação breve, conclusão e apelo diretos. Pouco espaço para desenvolvimento extenso — vá direto ao essencial.",
  },
  "30": {
    label: "30 minutos",
    maxOutputTokens: 3584,
    guidance:
      "Média (30 minutos falados). Introdução de 2 parágrafos curtos, 3 pontos com um exemplo ou aplicação prática cada, aplicação geral e conclusão bem desenvolvidas.",
  },
  "45": {
    label: "45 minutos",
    maxOutputTokens: 5300,
    guidance:
      "Desenvolvida (45 minutos falados). Introdução de 2 a 3 parágrafos, 3 ou 4 pontos com exemplo e aplicação prática cada, aplicação final e conclusão substanciais.",
  },
  "60": {
    label: "60 minutos",
    maxOutputTokens: 6000,
    guidance:
      `Aprofundada, mas confortável de ler — isto é MATERIAL DE APOIO para o pregador desenvolver ao vivo por até 60 minutos, não um texto para ser lido literalmente palavra por palavra. Não é um livro. Priorize conteúdo substancial sem redundância: cada seção deve trazer algo que as outras não trazem. Siga estas metas por campo (em parágrafos curtos — poucas frases cada, nunca um bloco único de texto):
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

const FORMAT_LABELS: Record<(typeof sermonFormats)[number], string> = {
  expositiva: "expositiva (desenvolve o texto bíblico verso a verso ou por unidades naturais)",
  tematica: "temática (organizada em torno de um tema, com apoio de várias passagens)",
  textual: "textual (estrutura extraída diretamente dos pontos de um único texto curto)",
  evangelistica: "evangelística (com convite claro à fé em Cristo)",
  doutrinaria: "doutrinária (explica e fundamenta uma doutrina bíblica específica)",
};

const AUDIENCE_LABELS: Record<SermonInput["audience"], string> = {
  geral: "igreja em geral",
  jovens: "jovens",
  adolescentes: "adolescentes",
  criancas: "crianças",
  mulheres: "mulheres",
  homens: "homens",
  lideres: "líderes da igreja",
  obreiros: "obreiros",
};

const STYLE_LABELS: Record<SermonInput["style"], string> = {
  simples: "simples e direto",
  ensino: "de ensino, didático",
  reflexivo: "reflexivo, que convida à meditação",
  impactante: "impactante, com força retórica",
  pastoral: "pastoral, acolhedor",
  devocional: "devocional, íntimo",
};

const DEPTH_GUIDANCE: Record<SermonInput["depth"], string> = {
  basica: "Básica: explicação acessível e direta, sem se demorar em nuances de contexto ou teologia — foque no essencial do texto de forma clara.",
  intermediaria: "Intermediária: bom equilíbrio entre acessibilidade e profundidade — explique o contexto e os conceitos com cuidado, sem virar aula.",
  profunda: "Profunda: aprofunde a análise do contexto histórico/literário, seja mais preciso nos conceitos bíblicos e explore relações importantes do texto com outras passagens — sem transformar a mensagem em aula acadêmica. Profundidade é sobre qualidade da análise, não sobre escrever mais por escrever.",
  teologica: "Teológica: aprofunde ainda mais a análise do contexto, a precisão conceitual e as relações bíblicas do texto, trazendo uma leitura teologicamente robusta — mas continue em linguagem pregável e pastoral, nunca em jargão acadêmico. Não é uma aula de seminário.",
};

const BIBLE_VERSION_LABELS: Record<Exclude<SermonInput["bibleVersion"], "padrao">, string> = {
  ara: "Almeida Revista e Atualizada (ARA)",
  arc: "Almeida Revista e Corrigida (ARC)",
  naa: "Nova Almeida Atualizada (NAA)",
  nvi: "Nova Versão Internacional (NVI)",
  ntlh: "Nova Tradução na Linguagem de Hoje (NTLH)",
  acf: "Almeida Corrigida Fiel (ACF)",
};

const SYSTEM_INSTRUCTION = `Você ajuda pregadores cristãos a preparar mensagens para o púlpito, em português do Brasil.

Regras de estilo:
- Escreva de forma natural, pastoral e pregável — nunca acadêmica ou rebuscada.
- Nunca use títulos teológicos artificiais. Prefira títulos simples e diretos.
- Seja bíblico, claro e aplicável à vida real do ouvinte.
- Use como base o texto/passagem e o tema informados pelo usuário (quando os dois forem dados, o tema direciona o ângulo da mensagem sobre aquele texto).
- Três eixos independentes e complementares, cada um com um papel diferente — nunca misture o que cada um decide:
  - "Formato da mensagem": COMO a mensagem é construída estruturalmente (ex.: expositiva desenvolve o texto verso a verso, evangelística tem apelo claro à conversão, doutrinária fundamenta uma doutrina).
  - "Público": PRA QUEM é a mensagem (ajusta vocabulário e exemplos — crianças pedem linguagem bem simples; líderes/obreiros toleram mais profundidade prática).
  - "Estilo": COM QUE TOM a mensagem soa (ex.: simples, impactante, reflexivo) — nunca muda a fidelidade bíblica do conteúdo.
  Exemplo: Formato "expositiva" + Público "jovens" + Estilo "impactante" = uma pregação expositiva, voltada para jovens, com linguagem mais forte e marcante — os três se combinam, nenhum substitui o outro.
- Se o usuário informar uma situação específica em observações adicionais (ex.: "será para um culto de missões", "é uma reunião de líderes"), use isso para ambientar o tom de abertura/fechamento da mensagem a esse contexto.
- "Profundidade" controla o NÍVEL DE ANÁLISE (contexto, precisão conceitual, relações do texto) — nunca o tamanho do texto, que é controlado pela Duração. Uma mensagem de 15 minutos com profundidade "profunda" deve ser curta E analiticamente cuidadosa, não uma mensagem longa.
- Toda pregação precisa de aplicação prática real em cada ponto — nunca entregue só explicação bíblica.
- "palavra_original": inclua uma palavra em hebraico (Antigo Testamento) ou grego (Novo Testamento) apenas quando ela realmente ajudar a entender o ponto; use null quando não houver uma palavra relevante. Nunca invente etimologias, transliterações ou significados — se não tiver certeza, use null.
- Se uma versão da Bíblia for indicada como preferência, use-a como referência de registro/linguagem ao citar ou parafrasear o texto (mais formal ou mais contemporânea, conforme a tradução) — nunca copie um trecho extenso e literal de uma tradução específica; texto_base e qualquer citação devem ser uma citação/paráfrase fiel e concisa, no seu próprio texto, nunca uma reprodução extensa de uma obra com direitos autorais.
- Se houver observações adicionais do usuário, respeite essas instruções específicas dentro do que for bíblica e pastoralmente responsável.
- Em todo campo de texto mais longo (introducao, contexto_biblico, explicacao de cada ponto, aplicacao_final, conclusao): escreva em parágrafos curtos (poucas frases cada), separados por uma linha em branco entre eles — nunca um bloco único de texto extenso. Isso é para leitura confortável em celular.
- Evite repetir a mesma ideia, explicação ou aplicação em seções diferentes (introdução, pontos, aplicação final, conclusão) — cada seção deve trazer conteúdo distinto.
- O tempo de duração representa material de apoio suficiente para o pregador desenvolver ao vivo nesse tempo, não um texto para ser lido literalmente do início ao fim.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: SermonInput): string {
  const duration = DURATION_CONFIG[input.duration];

  const lines = [`Texto bíblico ou passagem: ${input.passage}`];
  if (input.theme.trim()) {
    lines.push(`Tema: ${input.theme.trim()}`);
  }
  if (input.format) {
    lines.push(`Formato da mensagem: ${FORMAT_LABELS[input.format]}`);
  }
  lines.push(`Público: ${AUDIENCE_LABELS[input.audience]}`);
  lines.push(`Duração alvo: ${duration.label}`);
  lines.push(`Estilo: ${STYLE_LABELS[input.style]}`);
  lines.push(`Profundidade: ${input.depth}`);
  if (input.bibleVersion !== "padrao") {
    lines.push(`Versão da Bíblia de referência: ${BIBLE_VERSION_LABELS[input.bibleVersion]}`);
  }
  if (input.notes.trim()) {
    lines.push(`Observações adicionais do pastor: ${input.notes.trim()}`);
  }

  return `${lines.join("\n")}

${duration.guidance}

${DEPTH_GUIDANCE[input.depth]}

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
      `[AI-LOG] tool=pregacao model=${MODEL} duration=${input.duration}min input_tokens=${usage.total_input_tokens} output_tokens=${usage.total_output_tokens} total_tokens=${usage.total_tokens} latency_ms=${latencyMs} success=${success}`,
    );
  }
}
