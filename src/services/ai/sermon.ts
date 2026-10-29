import "server-only";
import { z } from "zod";
import { generateStructured, toGeminiJsonSchema } from "./generate";

// Modelo escolhido: gemini-3.1-flash-lite. É o Flash "current" da família
// Lite (não a 2.0/2.5, já superadas), otimizado pelo próprio Google para
// "high-frequency, lightweight tasks" e "low-latency, cost-effective" —
// exatamente o perfil de custo/velocidade que queremos para gerar uma
// pregação estruturada. Ver relatório desta etapa para a comparação de
// custo com os demais modelos Flash disponíveis em ai.google.dev/gemini-api/docs/pricing.
// (MODEL em si vive em generate.ts, único lugar — ver comentário lá.)

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
  "contemplativo",
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
export const bibleVersions = [
  "padrao",
  "ara",
  "arc",
  "naa",
  "nvi",
  "ntlh",
  "acf",
  "biblia_viva",
] as const;

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
  versiculos_apoio: z
    .array(z.string().min(1))
    .min(1)
    .max(3)
    .nullable()
    .describe(
      "De 1 a 3 referências bíblicas REAIS (referências cruzadas) que reforçam este ponto específico, além do texto base principal — formato 'Referência — breve ideia ou trecho do versículo' (ex.: 'Tiago 1:17 — todo dom perfeito vem do Pai'). Nunca invente uma referência que não existe; use null só quando genuinamente não houver versículo de apoio relevante para este ponto.",
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
- versiculos_apoio (em cada ponto): 1 a 3 referências reais.
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
  contemplativo: "contemplativo, profundo e transformador (ver diretrizes do estilo abaixo)",
};

// Diretrizes extras, só para estilos que mudam mais que o tom de voz.
// "Contemplativo" é uma abordagem inteira (como a mensagem desperta a
// consciência do ouvinte), então precisa de instruções próprias além do
// rótulo curto — mapeadas aos campos reais do schema da pregação.
const STYLE_GUIDANCE: Partial<Record<SermonInput["style"], string>> = {
  contemplativo: `Diretrizes do estilo "Contemplativo": escreva como um pregador cristão com profunda compreensão das Escrituras, da natureza humana, da psicologia espiritual e dos ensinamentos de Jesus. Tom pastoral, contemplativo, profundo e transformador, com linguagem simples, humana e acolhedora.

Como conduzir a mensagem:
1. Desperte a consciência. Não se limite a narrar o acontecimento bíblico: explore as contradições humanas reveladas no texto (orgulho, medo, egoísmo, culpa, vaidade, apego, perdão, amor).
2. Confronte sem condenar. Leve o ouvinte a reconhecer as próprias atitudes sem humilhá-lo; o objetivo é arrependimento sincero, despertar espiritual e transformação interior.
3. Aproxime do cotidiano com situações reais: perder a paciência com a família, guardar ressentimento, buscar reconhecimento, sentir inveja, querer controlar tudo.
4. Use parábolas e metáforas simples da vida (uma árvore, um rio, uma semente, um espelho, a luz e a escuridão) para explicar verdades espirituais.
5. Alimente a sede de Deus. Mesmo ao tratar de temas difíceis, conduza à misericórdia, à presença divina, à esperança e à possibilidade de transformação.
6. Mantenha fidelidade bíblica. Diferencie claramente o que o texto bíblico diz das reflexões psicológicas e espirituais que você acrescenta; nunca atribua à Bíblia ensinamentos que ela não apresenta.
7. Evite linguagem religiosa artificial, frases motivacionais vazias, julgamentos agressivos, moralismo excessivo e jargões esotéricos.

Princípio central: não pregue apenas sobre os erros de Pedro, Davi ou Paulo. Mostre como essas histórias revelam conflitos que também existem dentro de nós. Não ofereça só informação bíblica: conduza o ouvinte a examinar o próprio coração, iluminando a mente, tocando as feridas da alma e despertando o desejo sincero de viver mais perto de Deus.

Marcas da voz (o jeito de falar, mais importante que qualquer regra acima):
- Frases curtas e diretas, como alguém conversando de perto. Nada de tom de aula nem de palavras rebuscadas.
- Conte o fato bíblico em poucas frases simples e então vire o espelho para o ouvinte, com uma observação como "e talvez a lição mais profunda seja...".
- Mostre as contradições do dia a dia em frases paralelas e reconhecíveis, no estilo: "Oramos pedindo paz, mas tratamos a família com impaciência. Pedimos perdão a Deus, mas guardamos ressentimento. Falamos de amor, mas somos indiferentes à dor de quem está perto." Use situações concretas, não abstrações como "falhas" ou "lutas".
- Tenha uma frase-chave curta, que resuma a virada da mensagem (por exemplo: "Nem sempre o que precisamos transformar está lá fora; muitas vezes está escondido dentro de nós.").
- Acolha logo depois de confrontar: Deus mostra essas sombras não para condenar, mas para que o Seu amor as transforme.
- Faça perguntas de autoexame na primeira pessoa ("Tenho coragem de reconhecer em mim o que tanto critico nos outros?"), não perguntas retóricas genéricas.
- Termine com algo pequeno e prático que a pessoa possa fazer hoje (por exemplo, observar a própria reação quando alguém a contrariar e perceber se vem do orgulho ou do amor).
- Quando couber, feche com uma frase de contraste simples, como: "Conhecer a Palavra ilumina a mente; viver seus ensinamentos transforma o coração."
Isso é só para sentir o tom: nunca copie nem reaproveite o conteúdo desses exemplos, escreva sempre a partir do texto bíblico informado.

Como isso se encaixa nos campos da resposta:
- "introducao": abra com uma pergunta profunda que desperte identificação.
- "contexto_biblico": contextualização bíblica clara do texto.
- "pontos": cada ponto une a reflexão sobre a natureza humana, exemplos concretos do cotidiano e um confronto de consciência feito com amor e misericórdia; o "exemplo_aplicacao" de cada ponto deve ser uma situação real e reconhecível, terminando numa pequena prática para hoje.
- "aplicacao_final": questionamentos que convidem ao autoexame, em vez de ordens ou lista de tarefas.
- "conclusao", "apelo" e "oracao_final": conduzem à presença de Deus, à paz e à transformação interior.`,
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
  biblia_viva: "Bíblia Viva (paráfrase, linguagem bem coloquial e direta)",
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
- Humanidade e especificidade (é isto que separa uma pregação viva de uma genérica):
  - Prefira o concreto ao abstrato. Em vez de "falhas", "lutas", "fardos" ou "desafios", diga a situação: a conta que não fecha, a mensagem que você deixou sem resposta, o pai que nunca pediu desculpa, o culto em que você estava de corpo presente e com a cabeça longe.
  - Cada ponto precisa de pelo menos uma cena reconhecível da vida real, contada em poucas frases, com gente de verdade dentro (quem, onde, o que foi dito). Quando a ilustração for criada por você, apresente-a como tal ("imagine...", "pense em alguém que...") — nunca invente testemunho, estatística, citação de autor nem história apresentada como fato.
  - Extraia detalhes específicos do próprio texto bíblico (o que foi dito, o que se repetiu, o que NÃO foi dito, o número, o lugar, a ordem das cenas) em vez de resumir o texto em ideias gerais.
  - Evite frases de efeito que servem para qualquer texto: "Deus tem um propósito", "o amor de Deus é maior que tudo", "confie no Senhor", "nada é impossível para Deus", "o tempo de Deus é perfeito", "em um mundo cada vez mais...", "é importante lembrar que", "vivemos em dias...". Se a frase caberia em qualquer pregação, reescreva com algo que só funcione para ESTE texto.
  - Varie as aberturas. Não comece sempre com a pergunta "Você já sentiu...?". Pode abrir com uma cena, uma fala do personagem, uma imagem concreta ou uma afirmação que surpreenda.
  - Soe como uma pessoa falando a outra, não como um artigo: alterne frases curtas e médias, use o "nós" e admita, sem exagero, que o pregador também se reconhece ali. Evite sequências de três substantivos abstratos e o padrão repetido "não é X, nem Y, mas Z".
  - Aplicações: sempre uma ação específica e pequena ligada ao que o texto disse (a quem ligar, o que deixar de fazer esta semana, que pergunta fazer a si mesmo) — nunca "ore mais", "leia a Bíblia" ou "confie em Deus" soltos.
  - Títulos humanos e específicos do texto; evite fórmulas como "O Poder de...", "O Caminho para...", "A Chave para...".
  - Ser humano e concreto não é ser informal demais nem inventar o que o texto não diz: mantenha reverência e fidelidade bíblica.
- Toda pregação precisa de aplicação prática real em cada ponto — nunca entregue só explicação bíblica.
- "palavra_original": inclua uma palavra em hebraico (Antigo Testamento) ou grego (Novo Testamento) apenas quando ela realmente ajudar a entender o ponto; use null quando não houver uma palavra relevante. Nunca invente etimologias, transliterações ou significados — se não tiver certeza, use null.
- "versiculos_apoio": em CADA ponto, traga de 1 a 3 referências cruzadas reais que sustentam o argumento daquele ponto (além do texto base principal da mensagem) — isso é o que diferencia uma pregação bem fundamentada de uma que só parafraseia um texto único. Só use null se genuinamente não houver referência de apoio relevante, o que deve ser raro. Nunca invente uma referência, capítulo ou versículo que não existe — se não tiver certeza absoluta de que a referência é real e diz o que você está afirmando, prefira null a arriscar.
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
${STYLE_GUIDANCE[input.style] ? `\n${STYLE_GUIDANCE[input.style]}\n` : ""}
Gere uma pregação completa e um esboço resumido para o púlpito, seguindo o formato pedido.`;
}

const sermonJsonSchema = toGeminiJsonSchema(sermonContentSchema);

// Reescrito pra usar o núcleo compartilhado (generateStructured, em
// generate.ts) em vez da própria chamada direta à Gemini que existia
// aqui antes — essa duplicação é exatamente por que o SHARED_STYLE_RULES
// (maiúscula reverencial correta) e fixReverentialCapitalization nunca
// pegavam nas pregações: achado ao vivo, "dEle" continuava aparecendo
// mesmo depois da correção em generate.ts, porque esta função nunca
// passava por lá. Mantém a mesma forma de retorno (`sermon`, não
// `data`) pra não quebrar quem já chama generateSermon().
export async function generateSermon(
  input: SermonInput,
  options: { model?: string } = {},
): Promise<GenerateSermonResult> {
  const duration = DURATION_CONFIG[input.duration];
  const result = await generateStructured({
    model: options.model,
    tool: "pregacao",
    logDuration: `${input.duration}min`,
    systemInstruction: SYSTEM_INSTRUCTION,
    input: buildPrompt(input),
    maxOutputTokens: duration.maxOutputTokens,
    schema: sermonContentSchema,
    jsonSchema: sermonJsonSchema,
  });
  if (!result.success) return result;
  return { success: true, sermon: result.data };
}
