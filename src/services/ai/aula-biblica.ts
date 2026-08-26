import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";

// Ferramenta irmã de Pregação (sermon.ts), mas NUNCA uma cópia dela:
// Pregação é para ministração/púlpito; Aula Bíblica é para ensino,
// compreensão, participação e aplicação — a estrutura muda conforme o
// ambiente (Escola Bíblica, Célula, Discipulado, Outro). Usa o helper
// genérico generateStructured (mesmo padrão de devotional.ts), nunca o
// padrão antigo hand-rolled de sermon.ts.

export const aulaBiblicaAmbientes = ["escola_biblica", "celula", "discipulado", "outro"] as const;
export const aulaBiblicaPublicos = ["criancas", "adolescentes", "jovens", "adultos", "geral"] as const;
export const aulaBiblicaDuracoes = ["30", "45", "60", "90"] as const;
export const aulaBiblicaProfundidades = ["basica", "intermediaria", "aprofundada"] as const;
// Cópia própria da mesma lista de sermon.ts — zero import/edição em
// sermon.ts, pra não tocar em nenhum jeito numa ferramenta existente.
export const aulaBiblicaBibleVersions = ["padrao", "ara", "arc", "naa", "nvi", "ntlh", "acf"] as const;

export type AulaBiblicaInput = {
  tema: string;
  ambiente: (typeof aulaBiblicaAmbientes)[number];
  publico: (typeof aulaBiblicaPublicos)[number];
  duracao: (typeof aulaBiblicaDuracoes)[number];
  profundidade: (typeof aulaBiblicaProfundidades)[number];
  bibleVersion: (typeof aulaBiblicaBibleVersions)[number];
  objetivo: string;
  notes: string;
};

const pontoAulaSchema = z.object({
  titulo: z.string().min(1).describe("Título curto do ponto de desenvolvimento, claro e didático"),
  explicacao: z
    .string()
    .min(1)
    .describe(
      "Explicação bíblica e didática do ponto, em parágrafos curtos separados por uma linha em branco. Direto, sem repetir os outros pontos.",
    ),
  referencias: z
    .array(z.string().min(1))
    .min(1)
    .max(4)
    .describe("Referências bíblicas reais e relevantes para este ponto — nunca invente uma referência."),
  exemplo_aplicacao: z
    .string()
    .min(1)
    .nullable()
    .describe(
      "Exemplo ou aplicação prática deste ponto específico, quando fizer sentido. Use null quando não houver um exemplo genuíno a acrescentar — não force.",
    ),
  pergunta_participacao: z
    .string()
    .min(1)
    .describe("Pergunta curta para engajar a turma/grupo neste ponto específico, nunca de sim/não."),
});

const conceitoImportanteSchema = z.object({
  termo: z.string().min(1).describe("Termo ou conceito bíblico explicado"),
  explicacao: z
    .string()
    .min(1)
    .describe(
      "Explicação simples do termo, em linguagem acessível ao público da aula — nunca invente etimologias ou significados de grego/hebraico.",
    ),
});

const atividadeDinamicaSchema = z
  .object({
    titulo: z.string().min(1).describe("Nome curto da atividade ou dinâmica"),
    instrucoes: z
      .string()
      .min(1)
      .describe("Como conduzir a atividade, em passos simples e objetivos, adequados ao tempo e ao público"),
  })
  .nullable()
  .describe(
    "Atividade ou dinâmica prática, apenas quando o ambiente e o público realmente justificarem. Use null quando não houver uma atividade genuína a propor — nunca incluir apenas para preencher.",
  );

export const aulaBiblicaContentSchema = z.object({
  titulo: z.string().min(1).describe("Título natural da aula, sem jargão acadêmico"),
  texto_base: z.string().min(1).describe("Texto base ou passagem bíblica principal da aula"),
  objetivo_aula: z
    .string()
    .min(1)
    .describe("Objetivo da aula em uma ou duas frases curtas — o que o aluno deve compreender ou aplicar ao final"),
  introducao: z
    .string()
    .min(1)
    .describe("Parágrafos curtos separados por linha em branco, que despertam interesse sem antecipar o desenvolvimento"),
  contexto_biblico: z
    .string()
    .min(1)
    .describe(
      "Só o pano de fundo histórico/bíblico necessário para entender a passagem — em linguagem simples, parágrafos curtos",
    ),
  pontos: z
    .array(pontoAulaSchema)
    .length(3)
    .describe("Exatamente 3 pontos principais de desenvolvimento da aula, sem sobreposição entre eles"),
  conceitos_importantes: z
    .array(conceitoImportanteSchema)
    .min(1)
    .max(4)
    .nullable()
    .describe(
      "Termos ou conceitos importantes explicados, somente quando necessário para a compreensão da aula. Use null quando não houver conceito que precise de explicação separada.",
    ),
  aplicacao_pratica: z
    .string()
    .min(1)
    .describe("Aplicação prática geral da aula, complementar às aplicações de cada ponto — parágrafos curtos"),
  perguntas_discussao: z
    .array(z.string().min(1))
    .min(3)
    .max(5)
    .describe("3 a 5 perguntas abertas para discussão em grupo — nunca perguntas de sim/não"),
  atividade_dinamica: atividadeDinamicaSchema,
  conclusao: z.string().min(1).describe("Fechamento breve, sem introduzir ideia nova"),
  desafio_semana: z.string().min(1).describe("Desafio prático curto para a semana, ligado ao tema da aula"),
});

export type AulaBiblicaContent = z.infer<typeof aulaBiblicaContentSchema>;

const AMBIENTE_CONFIG: Record<AulaBiblicaInput["ambiente"], { label: string; guidance: string }> = {
  escola_biblica: {
    label: "Escola Bíblica Dominical",
    guidance:
      "Ambiente de Escola Bíblica: priorize ensino estruturado — contexto bem explicado, desenvolvimento didático e claro, perguntas para a classe bem definidas e aplicação prática ligada ao conteúdo ensinado. Tom de professor, não de pregador.",
  },
  celula: {
    label: "Célula / Pequeno Grupo",
    guidance:
      "Ambiente de célula/pequeno grupo: tom mais conversacional e caloroso. Priorize perguntas abertas que gerem participação real do grupo, espaço para reflexão e aplicação pessoal, e — quando fizer sentido — uma dinâmica simples. Menos exposição, mais diálogo.",
  },
  discipulado: {
    label: "Discipulado",
    guidance:
      "Ambiente de discipulado: foco em formação pessoal e mudança prática de vida. Priorize perguntas de reflexão profunda, aplicação pessoal concreta e um desafio real de colocar em prática — tom mais próximo e direto, de mentor para discípulo.",
  },
  outro: {
    label: "Outro ambiente de ensino",
    guidance:
      "Ambiente não especificado: mantenha um equilíbrio entre ensino claro e participação — nem tão expositivo quanto uma aula formal, nem tão informal quanto uma célula. Priorize clareza e aplicabilidade em qualquer contexto de ensino.",
  },
};

const PUBLICO_LABELS: Record<AulaBiblicaInput["publico"], string> = {
  criancas: "crianças",
  adolescentes: "adolescentes",
  jovens: "jovens",
  adultos: "adultos",
  geral: "público geral (mistura de idades)",
};

const DURATION_CONFIG: Record<
  AulaBiblicaInput["duracao"],
  { label: string; maxOutputTokens: number; guidance: string }
> = {
  "30": {
    label: "30 minutos",
    maxOutputTokens: 3200,
    guidance:
      "Aula compacta (30 minutos). Introdução breve, os 3 pontos com explicação objetiva, perguntas diretas. Sem espaço para desenvolvimento extenso.",
  },
  "45": {
    label: "45 minutos",
    maxOutputTokens: 4200,
    guidance:
      "Aula de tamanho médio (45 minutos). Introdução e contexto um pouco mais desenvolvidos, os 3 pontos com exemplo/aplicação quando fizer sentido.",
  },
  "60": {
    label: "60 minutos",
    maxOutputTokens: 5400,
    guidance:
      "Aula desenvolvida (60 minutos). Introdução, contexto e os 3 pontos bem trabalhados, com espaço real para participação da turma.",
  },
  "90": {
    label: "90 minutos",
    maxOutputTokens: 6800,
    guidance:
      "Aula longa (90 minutos) — ainda material de apoio para o professor conduzir, não um texto para ler literalmente. Desenvolva mais os 3 pontos e deixe claro espaço para atividade/dinâmica e discussão.",
  },
};

const PROFUNDIDADE_GUIDANCE: Record<AulaBiblicaInput["profundidade"], string> = {
  basica: "Profundidade básica: linguagem bem acessível, direto ao essencial do texto, sem se demorar em nuances de contexto.",
  intermediaria:
    "Profundidade intermediária: bom equilíbrio entre acessibilidade e conteúdo — explique contexto e conceitos com cuidado, sem virar aula acadêmica.",
  aprofundada:
    "Profundidade aprofundada: analise contexto histórico/literário e conceitos com mais cuidado e precisão — mas continue em linguagem de sala de aula/célula, nunca em jargão de seminário.",
};

const BIBLE_VERSION_LABELS: Record<Exclude<AulaBiblicaInput["bibleVersion"], "padrao">, string> = {
  ara: "Almeida Revista e Atualizada (ARA)",
  arc: "Almeida Revista e Corrigida (ARC)",
  naa: "Nova Almeida Atualizada (NAA)",
  nvi: "Nova Versão Internacional (NVI)",
  ntlh: "Nova Tradução na Linguagem de Hoje (NTLH)",
  acf: "Almeida Corrigida Fiel (ACF)",
};

const SYSTEM_INSTRUCTION = `Você é um assistente especializado na preparação de aulas bíblicas. Sua função é ajudar professores, líderes e discipuladores a transformar um tema ou passagem bíblica em uma aula clara, fiel ao texto, didática e fácil de conduzir.

Regras gerais:
- Isto é uma AULA, não uma pregação: o objetivo é ensino, compreensão, participação e aplicação — nunca ministração de púlpito. Nunca escreva como se fosse uma mensagem pregada.
- A estrutura, a linguagem e a dinâmica da aula devem se adaptar ao ambiente de ensino informado (Escola Bíblica, Célula/Pequeno Grupo, Discipulado ou Outro) e ao público (crianças, adolescentes, jovens, adultos ou público geral).
- Adapte o vocabulário à faixa etária do público: crianças pedem linguagem bem simples e concreta; adultos toleram mais profundidade.
- Adapte o volume/desenvolvimento do conteúdo à duração informada — a duração controla TAMANHO, a profundidade controla NÍVEL DE ANÁLISE; são eixos independentes, nunca confunda os dois.
- Nunca invente fatos históricos, referências bíblicas ou significados de palavras em grego/hebraico. Se não tiver certeza, não inclua.
- Nunca apresente uma interpretação teológica controversa como se fosse consenso entre os cristãos — quando relevante, sinalize brevemente que há leituras cristãs diferentes sobre o ponto, sem tomar partido.
- Se houver observações adicionais do usuário, use-as para guiar o tom/ênfase da aula — mas elas nunca justificam distorcer o sentido da passagem.
- "conceitos_importantes": inclua termos/conceitos explicados apenas quando genuinamente necessários para entender a aula; use null quando não houver nenhum que agregue.
- "atividade_dinamica": proponha uma atividade ou dinâmica só quando o ambiente e o público realmente pedirem isso (ex.: célula com adultos, aula com crianças) — use null caso contrário. Nunca inclua uma atividade só para preencher o campo.
- "perguntas_discussao": sempre de 3 a 5 perguntas abertas, nunca de sim/não.
- Evite conteúdo genérico, repetitivo ou artificialmente longo — cada seção deve trazer algo que as outras não trazem.
- Em todo campo de texto mais longo, escreva em parágrafos curtos separados por uma linha em branco entre eles — nunca um bloco único de texto extenso.
- O resultado deve ler como material de apoio para um professor/líder realmente conduzir uma aula — nunca como um artigo ou uma pregação.
- Se uma versão da Bíblia for indicada como preferência, use-a como referência de registro/linguagem — nunca copie um trecho extenso e literal de uma tradução com direitos autorais; texto_base e qualquer citação devem ser uma paráfrase fiel e concisa, no seu próprio texto.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: AulaBiblicaInput): string {
  const ambiente = AMBIENTE_CONFIG[input.ambiente];
  const duration = DURATION_CONFIG[input.duracao];

  const lines = [`Tema ou passagem bíblica: ${input.tema}`];
  lines.push(`Ambiente de ensino: ${ambiente.label}`);
  lines.push(`Público: ${PUBLICO_LABELS[input.publico]}`);
  lines.push(`Duração alvo: ${duration.label}`);
  lines.push(`Profundidade: ${input.profundidade}`);
  if (input.bibleVersion !== "padrao") {
    lines.push(`Versão da Bíblia de referência: ${BIBLE_VERSION_LABELS[input.bibleVersion]}`);
  }
  if (input.objetivo.trim()) {
    lines.push(`Objetivo específico informado pelo professor: ${input.objetivo.trim()}`);
  }
  if (input.notes.trim()) {
    lines.push(`Observações adicionais: ${input.notes.trim()}`);
  }

  return `${lines.join("\n")}

${ambiente.guidance}

${duration.guidance}

${PROFUNDIDADE_GUIDANCE[input.profundidade]}

Gere uma aula bíblica completa, seguindo exatamente o formato pedido.`;
}

const aulaBiblicaJsonSchema = toGeminiJsonSchema(aulaBiblicaContentSchema);

export async function generateAulaBiblica(
  input: AulaBiblicaInput,
): Promise<GenerateStructuredResult<AulaBiblicaContent>> {
  return generateStructured({
    tool: "aula_biblica",
    logDuration: input.duracao,
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: DURATION_CONFIG[input.duracao].maxOutputTokens,
    schema: aulaBiblicaContentSchema,
    jsonSchema: aulaBiblicaJsonSchema,
  });
}
