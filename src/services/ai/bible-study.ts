import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";
import type { SermonInput } from "./sermon";

export type BibleStudyInput = {
  passage: string;
  bibleVersion: SermonInput["bibleVersion"];
};

const BIBLE_VERSION_LABELS: Record<Exclude<SermonInput["bibleVersion"], "padrao">, string> = {
  ara: "Almeida Revista e Atualizada (ARA)",
  arc: "Almeida Revista e Corrigida (ARC)",
  naa: "Nova Almeida Atualizada (NAA)",
  nvi: "Nova Versão Internacional (NVI)",
  ntlh: "Nova Tradução na Linguagem de Hoje (NTLH)",
  acf: "Almeida Corrigida Fiel (ACF)",
};

const originalWordSchema = z.object({
  termo: z.string().min(1).describe("A palavra no idioma original (hebraico ou grego)"),
  idioma: z.enum(["hebraico", "grego"]).describe("Idioma da palavra original"),
  transliteracao: z
    .string()
    .nullable()
    .describe("Forma de leitura/pronúncia da palavra original; use null se não houver uma transliteração útil"),
  significado: z.string().min(1).describe("Significado da palavra, em linguagem simples"),
  explicacao: z
    .string()
    .min(1)
    .describe("Por que essa palavra ajuda a entender especificamente este ponto do texto"),
});

const connectionSchema = z.object({
  referencia: z.string().min(1).describe("Referência bíblica da conexão, ex.: 'Romanos 5:8'"),
  explicacao: z
    .string()
    .min(1)
    .describe("Como essa passagem se conecta de verdade com o texto principal — nunca uma referência solta"),
});

export const bibleStudyContentSchema = z.object({
  titulo: z.string().min(1).describe("Título natural e pastoral, sem jargão acadêmico"),
  passagem: z.string().min(1),
  contexto: z
    .string()
    .nullable()
    .describe(
      "Pano de fundo (autor, destinatários, situação, momento da narrativa, contexto histórico ou literário) — só quando isso realmente ajuda a entender o texto. Curto. Use null se não agregar valor real; não preencha só para ter conteúdo.",
    ),
  explicacao: z
    .string()
    .min(1)
    .describe(
      "A seção central: explica o sentido da passagem, mostra o raciocínio do texto, destaca detalhes importantes, relaciona ao contexto e explica palavras/expressões importantes quando necessário — tudo dentro desta única seção, fazendo o papel de um comentário bíblico acessível. Nunca crie uma segunda seção de comentário separada.",
    ),
  palavra_original: originalWordSchema
    .nullable()
    .describe(
      "No máximo uma palavra no idioma original, e somente se realmente agregar. Não force em toda passagem — use null quando não houver valor real.",
    ),
  conexoes_biblicas: z
    .array(connectionSchema)
    .min(1)
    .max(3)
    .describe("De 1 a 3 conexões genuinamente relevantes — nunca versículos aleatórios só para preencher."),
  aplicacao: z
    .string()
    .min(1)
    .describe(
      "Aplicação prática que nasce da interpretação do texto: atitude concreta, pergunta de reflexão ou decisão prática ligada à vida cristã real. Nunca genérica (nunca algo como 'confie mais em Deus' ou 'tenha fé' isolado, sem ligação direta com o que o texto acabou de mostrar).",
    ),
  resumo: z
    .string()
    .min(1)
    .describe(
      "Resumo curto — ao final da leitura, a pessoa deve conseguir responder: qual é a principal verdade desta passagem?",
    ),
});

export type BibleStudyContent = z.infer<typeof bibleStudyContentSchema>;

const SYSTEM_INSTRUCTION = `Você ajuda cristãos comuns (não teólogos) a entender uma passagem bíblica específica, em português do Brasil, de forma pastoral e prática — como um estudo bíblico bem feito, não um artigo acadêmico e não uma pregação.

A seção "explicacao" é o coração da resposta e faz o papel que um comentário bíblico faria, mas em linguagem acessível: explique o sentido da passagem, mostre o raciocínio do texto, destaque detalhes importantes, relacione ao contexto e explique palavras ou expressões relevantes diretamente no texto corrido, quando necessário. É a seção que pode ser mais desenvolvida. NUNCA crie uma segunda seção separada de "comentário" — tudo isso vive dentro de "explicacao", uma vez só.

Regras:
- Nunca use termos técnicos de teologia acadêmica (ex.: aoristo, homoousios, soteriologia) nem análise gramatical complexa.
- Evite superficialidade (não fique só na superfície do texto) e evite academicismo excessivo (não vire um artigo técnico) — o equilíbrio é uma explicação boa, clara e substancial.
- "contexto": curto e realmente útil (autor, destinatários, situação, contexto histórico/literário). Opcional de verdade — use null quando não ajudar a entender o texto, nunca preencha só para ocupar espaço. Nunca invente detalhes históricos.
- "palavra_original": no máximo uma palavra, só quando genuinamente relevante. Use null quando não houver valor real — não force em toda passagem.
- "conexoes_biblicas": de 1 a 3, todas genuinamente relacionadas ao texto — nunca jogue referências aleatórias só para preencher a lista. Cada uma precisa de uma explicação real da relação com a passagem estudada.
- "aplicacao": precisa nascer da interpretação do texto — prefira atitudes concretas, perguntas de reflexão, decisões práticas ou conexão com situações reais da vida cristã. Evite frases genéricas soltas como "confie mais em Deus" ou "tenha fé" sem ligação direta com o que o texto mostrou.
- "resumo": curto, permite responder "qual é a principal verdade desta passagem?" sem repetir literalmente o que já foi dito em "contexto" e "explicacao".
- Evite repetição entre contexto, explicação e resumo — cada seção traz algo que as outras não trazem.
- Parágrafos curtos (poucas frases cada) — nunca um bloco único de texto extenso. É para leitura confortável no celular.
- Isto NÃO é uma pregação — não estruture como sermão com pontos numerados.
- Se uma versão da Bíblia for indicada como preferência, use-a como referência de registro/linguagem ao citar ou parafrasear o texto (mais formal ou mais contemporânea, conforme a tradução) — nunca copie um trecho extenso e literal de uma tradução específica; a passagem em "passagem" deve ser uma citação/paráfrase fiel e concisa, no seu próprio texto, nunca uma reprodução extensa de uma obra com direitos autorais.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: BibleStudyInput): string {
  const lines = [`Passagem bíblica: ${input.passage}`];
  if (input.bibleVersion !== "padrao") {
    lines.push(`Versão da Bíblia de referência: ${BIBLE_VERSION_LABELS[input.bibleVersion]}`);
  }

  return `${lines.join("\n")}

Explique essa passagem de forma clara, pastoral e prática, seguindo o formato pedido.`;
}

// "explicacao" agora concentra o trabalho de comentário bíblico (antes
// dividido entre verdade_principal/explicacao_texto/cuidado_interpretacao,
// campos removidos nesta revisão), então a seção pode ser mais longa —
// 1500 não sobrava muita margem para isso. 1900 dá espaço confortável
// sem abrir demais (ver relatório desta etapa para os números reais).
const MAX_OUTPUT_TOKENS = 1900;
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
