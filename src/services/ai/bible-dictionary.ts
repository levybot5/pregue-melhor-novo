import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema, type GenerateStructuredResult } from "./generate";

// "Quem é Quem" NÃO é uma ferramenta separada — é só um dos tipos que
// o Dicionário Bíblico já cobre (tipo: "pessoa"). Um schema adaptativo
// (seções variáveis) cobre os outros tipos; "pessoa" usa campos fixos
// (ver PERSON_SECTIONS_SCHEMA) porque o usuário pediu leitura sempre
// padronizada aqui — nunca "Acertos e Erros" mesclados em uma seção.

export type BibleDictionaryInput = {
  query: string;
};

export const bibleDictionaryTypes = [
  "pessoa",
  "lugar",
  "conceito",
  "povo_ou_grupo",
  "objeto",
] as const;
export type BibleDictionaryType = (typeof bibleDictionaryTypes)[number];

const OTHER_TYPES = ["lugar", "conceito", "povo_ou_grupo", "objeto"] as const;

const genericSectionSchema = z.object({
  titulo: z
    .string()
    .min(1)
    .describe(
      "Título curto da seção, adaptado ao tipo do termo — ex.: 'Contexto', 'Principais Acontecimentos', 'Significado Bíblico', 'Termos Relacionados', 'Importância para a Vida Cristã', 'Importância Bíblica', 'Papel nos Evangelhos', 'Observações Importantes', ou outro título mais adequado a este termo específico",
    ),
  conteudo: z.string().min(1),
});

// Campos fixos e SEPARADOS de propósito — "não inventar" quando não
// houver informação real: use null, nunca preencha por preencher, e
// nunca junte acertos+erros no mesmo campo.
const personSectionsSchema = z.object({
  contexto: z.string().nullable(),
  principais_acontecimentos: z.string().nullable(),
  caracteristicas: z.string().nullable(),
  acertos: z.string().nullable().describe("Nunca combine com 'erros' — sempre um campo à parte"),
  erros: z.string().nullable().describe("Nunca combine com 'acertos' — sempre um campo à parte"),
  licoes: z.string().nullable(),
});

const commonFields = {
  termo: z
    .string()
    .min(1)
    .describe("Nome normalizado do termo pesquisado, ex.: 'Davi', 'Jerusalém', 'Justificação', 'Fariseus'"),
  identificacao: z
    .string()
    .min(1)
    .describe(
      "Resposta curta e direta (1-2 frases) à primeira pergunta natural sobre o termo: quem foi / o que é / o que significa / quem eram — a primeira coisa que a pessoa lê",
    ),
  referencias_biblicas: z
    .array(z.string().min(1))
    .min(1)
    .max(6)
    .describe("Referências bíblicas reais e principais relacionadas ao termo, ex.: '1 Samuel 17', 'Salmo 51'"),
};

const personEntrySchema = z.object({
  ...commonFields,
  tipo: z.literal("pessoa"),
  secoes_pessoa: personSectionsSchema,
});

const otherEntrySchemas = OTHER_TYPES.map((tipo) =>
  z.object({
    ...commonFields,
    tipo: z.literal(tipo),
    secoes: z
      .array(genericSectionSchema)
      .min(3)
      .max(7)
      .describe(
        "Seções adaptadas ao tipo do termo pesquisado, na ordem que fizer mais sentido para ele — só inclua seções com conteúdo real, não force uma lista fixa",
      ),
  }),
);

export const bibleDictionaryEntrySchema = z.discriminatedUnion("tipo", [
  personEntrySchema,
  ...otherEntrySchemas,
]);

export type BibleDictionaryEntry = z.infer<typeof bibleDictionaryEntrySchema>;

const SYSTEM_INSTRUCTION = `Você é um dicionário e enciclopédia bíblica acessível, em português do Brasil. O usuário pesquisa um termo, conceito, personagem, lugar, povo/grupo ou objeto bíblico, e você organiza o que a Bíblia e o contexto histórico direto dela dizem sobre isso — em linguagem simples e pastoral, nunca acadêmica.

"Quem é Quem" não é um recurso à parte: é só o que acontece quando o termo pesquisado é uma pessoa (tipo "pessoa").

QUANDO tipo = "pessoa": preencha "secoes_pessoa" com estes SEIS campos, sempre separados:
- contexto: de onde ele veio, época, situação inicial.
- principais_acontecimentos: os eventos centrais da vida dele.
- caracteristicas: traços marcantes de personalidade/caráter.
- acertos: o que ele fez bem, decisões e atitudes positivas. NUNCA combine com "erros" no mesmo texto.
- erros: falhas, pecados, decisões erradas — como campo totalmente separado de "acertos", mesmo que ambos sejam curtos.
- licoes: o que a vida dele ensina para quem lê hoje.
Se não houver informação real e específica para um desses seis campos, use null nesse campo — nunca invente conteúdo para preenchê-lo. Pode retornar um texto curto quando houver algo real, mesmo que pouco; só use null quando genuinamente não houver nada de valor a dizer.

QUANDO tipo for "lugar", "conceito", "povo_ou_grupo" ou "objeto": preencha "secoes" (array), adaptando os títulos ao tipo — use como GUIA DE ESTRUTURA, nunca copie o conteúdo destes exemplos:
- CONCEITO (ex.: Justificação) — identificacao: definição curta. Seções típicas: Significado Bíblico, Contexto, Termos Relacionados, Importância para a Vida Cristã.
- LUGAR (ex.: Jerusalém) — identificacao: o que é, em 1-2 frases. Seções típicas: Contexto, Importância Bíblica, Principais Acontecimentos.
- POVO OU GRUPO (ex.: Fariseus) — identificacao: quem eram, em 1-2 frases. Seções típicas: Contexto Histórico, Papel Bíblico (ex.: "Papel nos Evangelhos" se for o caso específico), Observações Importantes.
- OBJETO (ex.: Arca da Aliança, Tabernáculo) — identificacao: o que é/era. Seções típicas: Contexto, Função ou Uso, Significado, Principais Acontecimentos.
Use só as seções que tiverem conteúdo real para ESTE termo específico — não force todas as seções do exemplo, e adapte os títulos quando fizer mais sentido.

Regras críticas — leia com atenção:
- NUNCA invente datas, etimologias de grego/hebraico, relações familiares, acontecimentos, detalhes históricos ou tradições posteriores que não estejam claramente no texto bíblico ou em consenso histórico básico e amplamente aceito.
- Quando algo for incerto, discutido entre estudiosos, ou vier de tradição extra-bíblica (não do texto em si), diga isso explicitamente (ex.: "segundo a tradição judaica...", "não há consenso sobre..."); nunca apresente uma hipótese como se fosse fato certo.
- Se não tiver certeza de um detalhe, prefira omitir a inventar.
- Evite palavras absolutas ("sempre", "nunca", "constantemente", "todos", "certamente") quando o texto bíblico não sustentar claramente essa afirmação — um comportamento recorrente não é o mesmo que um comportamento absoluto. Prefira formulações como "em diversos momentos", "de forma recorrente", "na maior parte da narrativa". Isso vale só quando a certeza for real: quando o texto for claro e direto sobre algo, afirme normalmente, sem hedging desnecessário.
- Autoria, datação, tradição histórica ou qualquer ponto discutido entre estudiosos: use linguagem proporcional ao grau de certeza (ex.: "é tradicionalmente associado à autoria de...", "a tradição atribui...") em vez de tratar como fato estabelecido. Diferencie claramente o que o texto bíblico narra ("o texto relata...", "a narrativa apresenta...") do que é tradição posterior, hipótese histórica ou inferência teológica. Não exagere no outro sentido: não encha a resposta de "talvez"/"possivelmente"/"segundo alguns" quando a informação for clara — cautela só onde há incerteza real.
- "referencias_biblicas": só referências reais e verificáveis, nunca inventadas. Poucas referências genuinamente relevantes são melhores que muitas referências fracas — não force a lista para parecer mais completa.
- Em "licoes" (quando tipo = "pessoa"): a lição precisa nascer da narrativa específica desse personagem, nunca uma moralização genérica que serviria para qualquer outro personagem.
- Linguagem simples, pastoral, sem jargão acadêmico — mas sem perder profundidade real.
- Parágrafos curtos em cada seção/campo — nunca um bloco único de texto extenso. É para leitura confortável no celular.
- Responda sempre em português do Brasil.
- Responda SOMENTE com JSON seguindo exatamente o schema fornecido, sem texto fora do JSON.`;

function buildPrompt(input: BibleDictionaryInput): string {
  return `Termo pesquisado: ${input.query}

Identifique o que esse termo é (pessoa, lugar, conceito, povo/grupo ou objeto bíblico) e monte a entrada de dicionário completa, seguindo exatamente o formato pedido para esse tipo.`;
}

// Até 7 seções (ou os 6 campos fixos de pessoa) + identificação +
// referências — mais campos que a Bíblia Explicada, mas cada um é
// curto (é um verbete, não um estudo). 2000 dá espaço confortável sem
// abrir demais (ver relatório desta etapa para os números reais).
const MAX_OUTPUT_TOKENS = 2000;
const bibleDictionaryJsonSchema = toGeminiJsonSchema(bibleDictionaryEntrySchema);

export async function generateBibleDictionaryEntry(
  input: BibleDictionaryInput,
): Promise<GenerateStructuredResult<BibleDictionaryEntry>> {
  return generateStructured({
    tool: "dicionario_biblico",
    logDuration: "n/a",
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    schema: bibleDictionaryEntrySchema,
    jsonSchema: bibleDictionaryJsonSchema,
  });
}
