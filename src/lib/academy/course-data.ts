// Conteúdo da Academia do Pregador — dado estático versionado, não vem
// do banco nem de chamada à API do YouTube em runtime (ver §12/§21 do
// relatório). Títulos, módulos e durações vêm do levantamento real da
// playlist pública do canal RTM Brasil — nenhum título foi inventado,
// reordenado ou traduzido.
//
// Cada aula NÃO tem um youtube_video_id individual porque o levantamento
// de origem não trouxe esse dado por aula (só título + duração, por
// módulo, na ordem real da playlist). Em vez de inventar 265 IDs — o
// que arriscaria embutir o vídeo errado —, o player usa o embed oficial
// de PLAYLIST do YouTube (videoseries) com o ID real da playlist do
// canal + a posição da aula nela (index). Como a ordem dos módulos/aulas
// aqui é a mesma da playlist real, a posição aponta pro vídeo certo sem
// depender de um ID adivinhado.

export const RTM_CHANNEL_NAME = "RTM Brasil";
export const RTM_CHANNEL_URL = "https://www.youtube.com/@rtmbrasil";
export const RTM_PLAYLIST_ID = "PLaE9hceOTtPBpYxfHyeGqBQn9xmno8MDe";
export const RTM_PLAYLIST_URL = `https://www.youtube.com/playlist?list=${RTM_PLAYLIST_ID}`;

export const COURSE_ID = "teologia-basica" as const;

export type AcademyLesson = {
  lessonNumber: number; // global, 1-265 — também é a posição (1-based) na playlist real
  moduleId: number; // 1-11
  lessonInModule: number;
  title: string;
  duration: string; // "MM:SS", como no levantamento de origem
};

export type AcademyModule = {
  id: number; // 1-11
  title: string;
  description: string;
  lessonCount: number;
  durationLabel: string; // "5h19", como no levantamento de origem
};

export type AcademyCourse = {
  id: typeof COURSE_ID;
  title: string;
  channel: string;
  channelUrl: string;
  playlistUrl: string;
  totalLessons: number;
  totalModules: number;
  durationLabel: string; // "56h37"
};

type RawLesson = { title: string; duration: string };
type RawModule = {
  title: string;
  description: string;
  durationLabel: string;
  lessons: RawLesson[];
};

// Dados transcritos diretamente do levantamento (curso-teologia.pdf) —
// mesma ordem, mesmos títulos e durações.
const MODULE_DEFS: RawModule[] = [
  {
    title: "História da Igreja",
    description: "Das origens do Cristianismo ao pentecostalismo brasileiro",
    durationLabel: "5h19",
    lessons: [
      { title: "História da Igreja - Origem do Cristianismo", duration: "12:41" },
      { title: "História da Igreja - Expansão do Cristianismo", duration: "12:48" },
      { title: "História da Igreja - Perseguição aos Cristãos (64-313 dC)", duration: "13:14" },
      { title: "História da Igreja - Consolidação do Cristianismo - Pais Apostólicos e Pais da Igreja", duration: "13:16" },
      { title: "História da Igreja - Consolidação do Cristianismo - Apologistas e Polemistas", duration: "12:22" },
      { title: "História da Igreja - Consolidação do Cristianismo - Credo dos Apóstolos e a Formação do Cânon", duration: "13:41" },
      { title: "História da Igreja - A formação do Império Cristão", duration: "13:38" },
      { title: "História da Igreja - Papado: Surgimento e desenvolvimento", duration: "12:43" },
      { title: "História da Igreja - Concílios Ecumênicos", duration: "13:13" },
      { title: "História da Igreja - Invasões Bárbaras", duration: "13:54" },
      { title: "História da Igreja - Islamismo: Origem e Desenvolvimento", duration: "13:29" },
      { title: "História da Igreja - As Cruzadas e suas consequências", duration: "13:57" },
      { title: "História da Igreja - Primeira reação: Assimilação - Cisma de 1054", duration: "13:27" },
      { title: "História da Igreja - Segunda reação: A fuga - Monasticismo", duration: "14:13" },
      { title: "História da Igreja - Terceira reação: Resistência - Pré Reforma", duration: "13:17" },
      { title: "História da Igreja - Reforma Protestante - Martinho Lutero", duration: "13:28" },
      { title: "História da Igreja - Reforma Protestante - Ulrich Zuínglio e João Calvino", duration: "13:38" },
      { title: "História da Igreja - Reforma Radical: Movimento Anabatista", duration: "12:45" },
      { title: "História da Igreja - Pós Reforma: Puritanismo e Pietismo", duration: "14:33" },
      { title: "História da Igreja - Protestantismo Norte Americano", duration: "13:11" },
      { title: "História da Igreja - Movimento Pentecostal", duration: "12:10" },
      { title: "História da Igreja - Protestantismo no Brasil", duration: "13:27" },
      { title: "História da Igreja - Pentecostalismo e Neopentecostalismo no Brasil", duration: "13:49" },
      { title: "História da Igreja - Pentecostais x Carismáticos", duration: "12:11" },
    ],
  },
  {
    title: "Aconselhamento Bíblico",
    description: "Fundamentos, métodos e intervenções em crise",
    durationLabel: "4h31",
    lessons: [
      { title: "Aconselhamento Bíblico - O que é Aconselhamento Bíblico?", duration: "13:02" },
      { title: "Aconselhamento Bíblico - Qualidades de um Aconselhamento eficaz", duration: "11:00" },
      { title: "Aconselhamento Bíblico - Objetivo do Aconselhamento Bíblico", duration: "11:11" },
      { title: "Aconselhamento Bíblico - Fundamentos Bíblicos e Teológicos do aconselhamento", duration: "10:47" },
      { title: "Aconselhamento Bíblico - Revelação especial", duration: "11:07" },
      { title: "Aconselhamento Bíblico - Aconselhamento Noutético", duration: "10:51" },
      { title: "Aconselhamento Bíblico - Método Noutético", duration: "10:52" },
      { title: "Aconselhamento Bíblico - Método de Gary Collins", duration: "11:10" },
      { title: "Aconselhamento Bíblico - Método Gary Collins - Discipulado", duration: "10:56" },
      { title: "Aconselhamento Bíblico - Método de Howard Clinebell", duration: "11:43" },
      { title: "Aconselhamento Bíblico - Dimensões da saúde humana e Espiritualidade", duration: "11:16" },
      { title: "Aconselhamento Bíblico - Qual método de aconselhamento utilizar?", duration: "11:21" },
      { title: "Aconselhamento Bíblico - Motivações equivocadas para Aconselhar", duration: "11:36" },
      { title: "Aconselhamento Bíblico - Qualificações para ser um conselheiro (1ª pt)", duration: "10:17" },
      { title: "Aconselhamento Bíblico - Qualificações para ser um conselheiro (2ª pt)", duration: "11:47" },
      { title: "Aconselhamento Bíblico - O lugar correto para aconselhar", duration: "10:32" },
      { title: "Aconselhamento Bíblico - Intervenções das crises", duration: "10:49" },
      { title: "Aconselhamento Bíblico - Intervenções das crises - Ansiedade", duration: "9:56" },
      { title: "Aconselhamento Bíblico - Intervenções das crises - Problemas Conjugais", duration: "10:59" },
      { title: "Aconselhamento Bíblico - Intervenções das crises - Divórcios", duration: "12:13" },
      { title: "Aconselhamento Bíblico - Intervenções das crises - Luto", duration: "12:19" },
      { title: "Aconselhamento Bíblico - Intervenções das crises - Vícios", duration: "12:39" },
      { title: "Aconselhamento Bíblico - Intervenções das crises - Terceira Idade", duration: "11:59" },
      { title: "Aconselhamento Bíblico - Recordar: Objetivo do Aconselhamento Bíblico", duration: "10:49" },
    ],
  },
  {
    title: "Hermenêutica",
    description: "Princípios e métodos de interpretação bíblica",
    durationLabel: "4h57",
    lessons: [
      { title: "Hermenêutica - Necessidade da Interpretação", duration: "12:18" },
      { title: "Hermenêutica - Necessidade da interpretação: leitura, explicação e aproximação", duration: "11:06" },
      { title: "Hermenêutica - O que é Hermenêutica?", duration: "11:02" },
      { title: "Hermenêutica - Que tipo de leitura a Bíblia espera que nós façamos dela?", duration: "12:31" },
      { title: "Hermenêutica - A interpretação na Leitura Devocional", duration: "14:06" },
      { title: "Hermenêutica - O empenho humano na interpretação da Bíblia", duration: "13:04" },
      { title: "Hermenêutica - Critérios para a interpretação Bíblica", duration: "13:26" },
      { title: "Hermenêutica - Chaves de leitura", duration: "11:51" },
      { title: "Hermenêutica - Métodos de Interpretação: Princípio da observação", duration: "11:45" },
      { title: "Hermenêutica - Métodos de Interpretação: Perícope e Estudos Indutivos", duration: "12:56" },
      { title: "Hermenêutica - Método de Estudos Indutivos: Perguntas interpretativas", duration: "12:50" },
      { title: "Hermenêutica - Métodos de Estudos Indutivos: Contexto Histórico", duration: "12:16" },
      { title: "Hermenêutica - Métodos de Estudos Indutivos: Contexto Literário", duration: "12:04" },
      { title: "Hermenêutica - Métodos de Estudos Indutivos: Contexto Literário 2", duration: "13:07" },
      { title: "Hermenêutica - Métodos de Interpretação: Princípio da correlação", duration: "11:48" },
      { title: "Hermenêutica - Hermenêutica x Exegese", duration: "12:01" },
      { title: "Hermenêutica - Gêneros Literários", duration: "12:36" },
      { title: "Hermenêutica - Níveis de narrativas Bíblicas", duration: "12:24" },
      { title: "Hermenêutica - Como funciona uma estrutura narrativa?", duration: "12:40" },
      { title: "Hermenêutica - Textos narrativos e textos informativos", duration: "12:59" },
      { title: "Hermenêutica - Interpretação das Cartas 1", duration: "13:58" },
      { title: "Hermenêutica - Interpretação das Cartas 2", duration: "11:19" },
      { title: "Hermenêutica - Interpretação das Cartas: Identificação", duration: "10:59" },
      { title: "Hermenêutica - Materiais de apoio: Hermenêutica e exegese", duration: "12:04" },
    ],
  },
  {
    title: "Pregação Expositiva e Homilética",
    description: "Da convicção do pregador à prática do sermão",
    durationLabel: "5h24",
    lessons: [
      { title: "Pregação Expositiva e Homilética - Introdução", duration: "12:49" },
      { title: "Pregação Expositiva - A pregação na Contemporaneidade", duration: "12:34" },
      { title: "Pregação Expositiva - Palavra de Deus como centro das pregações", duration: "13:42" },
      { title: "Pregação Expositiva - Pregação em Tempos Líquidos", duration: "13:29" },
      { title: "Pregação Expositiva - A pessoa e as convicções do pregador", duration: "12:43" },
      { title: "Pregação Expositiva - Decifrando a mente do homem pós-moderno", duration: "12:16" },
      { title: "Pregação Expositiva - Os cinco \"P's\" da pregação", duration: "13:50" },
      { title: "Pregação Expositiva - Os quatro alvos da pregação", duration: "14:25" },
      { title: "Pregação Expositiva - Cinco perguntas para um bom esboço", duration: "13:36" },
      { title: "Pregação Expositiva - Sete perguntas interrogativas da pregação", duration: "13:37" },
      { title: "Pregação Expositiva - Regras elementares da Hermenêutica", duration: "13:35" },
      { title: "Pregação Expositiva - Classificações dos sermões quanto à estrutura", duration: "13:02" },
      { title: "Pregação Expositiva - Definição de Pregação Expositiva", duration: "13:12" },
      { title: "Pregação Expositiva - Exemplos de pregações e mensagens", duration: "13:17" },
      { title: "Pregação Expositiva - Exemplos de pregação textual", duration: "15:02" },
      { title: "Pregação Expositiva - Exemplos de pregação expositiva temática", duration: "14:50" },
      { title: "Pregação Expositiva - Características de uma igreja viva", duration: "14:47" },
      { title: "Pregação Expositiva - Os passos para a elaboração de um sermão expositivo temático", duration: "13:29" },
      { title: "Pregação Expositiva - Composição do esboço analítico", duration: "13:33" },
      { title: "Pregação Expositiva - Divisões maiores da pregação expositiva temática", duration: "13:03" },
      { title: "Pregação Expositiva - Estudos Indutivos", duration: "13:51" },
      { title: "Pregação Expositiva - Introdução da mensagem da pregação expositiva temática", duration: "14:11" },
      { title: "Pregação Expositiva - Prática da pregação expositiva temática", duration: "12:19" },
      { title: "Pregação Expositiva - Cinco atitudes que o cristão deve ter", duration: "13:12" },
    ],
  },
  {
    title: "Panorama do Antigo Testamento",
    description: "Pentateuco, livros históricos, poéticos e proféticos",
    durationLabel: "5h22",
    lessons: [
      { title: "Panorama do Antigo Testamento - Introdução Histórica do Antigo Testamento", duration: "12:50" },
      { title: "Panorama do Antigo Testamento - Livro de Gênesis: A criação do homem e o pecado no mundo", duration: "13:34" },
      { title: "Panorama do Antigo Testamento - Livro de Gênesis: Período Patriarcal", duration: "13:05" },
      { title: "Panorama do Antigo Testamento - Livro de Êxodo e Levítico: A presença de Deus", duration: "13:10" },
      { title: "Panorama do Antigo Testamento - Livro de Números e Deuteronômio: tribos de Israel", duration: "13:28" },
      { title: "Panorama do Antigo Testamento - Livros Históricos: Josué e Juízes", duration: "13:20" },
      { title: "Panorama do Antigo Testamento - Livros Históricos: Rute e 1 Samuel", duration: "13:41" },
      { title: "Panorama do Antigo Testamento - Livros Históricos: 2 Samuel - O reinado de Davi", duration: "13:43" },
      { title: "Panorama do Antigo Testamento - Livros Históricos: 1 Reis", duration: "13:18" },
      { title: "Panorama do Antigo Testamento - Livros Históricos: 2 Reis", duration: "13:25" },
      { title: "Panorama do Antigo Testamento - Livros Históricos: 1 e 2 Crônicas", duration: "13:34" },
      { title: "Panorama do Antigo Testamento - Livros Históricos: Esdras, Neemias e Ester", duration: "13:30" },
      { title: "Panorama do Antigo Testamento - Livros Poéticos: Jó", duration: "13:25" },
      { title: "Panorama do Antigo Testamento - Livros Poéticos: Salmos (parte 1)", duration: "13:33" },
      { title: "Panorama do Antigo Testamento - Livros Poéticos: Salmos (parte 2) e Provérbios", duration: "13:17" },
      { title: "Panorama do Antigo Testamento - Livros Poéticos: Eclesiastes e Cantares de Salomão", duration: "13:22" },
      { title: "Panorama do Antigo Testamento - Profetas do Antigo Testamento: Isaías", duration: "13:15" },
      { title: "Panorama do Antigo Testamento - Profetas do Antigo Testamento: Jeremias", duration: "13:28" },
      { title: "Panorama do Antigo Testamento - Profetas do Antigo Testamento: Ezequiel", duration: "12:57" },
      { title: "Panorama do Antigo Testamento - Profetas menores: Oseias e Amós", duration: "13:31" },
      { title: "Panorama do Antigo Testamento - Profetas Menores: Miquéias", duration: "13:43" },
      { title: "Panorama do Antigo Testamento - Profetas menores: Sofonia, Naum e Abacuque", duration: "13:46" },
      { title: "Panorama do Antigo Testamento - Profetas Menores: Ageu, Zacarias e Malaquias", duration: "13:23" },
      { title: "Panorama do Antigo Testamento - Profetas Menores: Jonas", duration: "13:54" },
    ],
  },
  {
    title: "Teologia do Novo Testamento",
    description: "Evangelhos e cartas paulinas e gerais",
    durationLabel: "5h13",
    lessons: [
      { title: "Teologia do Novo Testamento - Os quatro Evangelhos: Mateus", duration: "12:59" },
      { title: "Teologia do Novo Testamento - Os quatro evangelhos: Marcos", duration: "12:04" },
      { title: "Teologia do Novo Testamento - Os quatro evangelhos: Lucas", duration: "13:03" },
      { title: "Teologia do Novo Testamento - Os quatro evangelhos: João", duration: "13:48" },
      { title: "Teologia do Novo Testamento - Atos dos Apóstolos", duration: "12:49" },
      { title: "Teologia do Novo Testamento - Apóstolo Paulo e suas cartas", duration: "12:58" },
      { title: "Teologia do Novo Testamento - 1 Tessalonicenses", duration: "12:58" },
      { title: "Teologia do Novo Testamento - 2 Tessalonicenses e a relação de Paulo com a igreja de Corinto", duration: "13:07" },
      { title: "Teologia do Novo Testamento - 1 Coríntios (parte 1)", duration: "13:16" },
      { title: "Teologia do Novo Testamento - 1 Coríntios (parte 2)", duration: "13:03" },
      { title: "Teologia do Novo Testamento - 2 Coríntios", duration: "14:26" },
      { title: "Teologia do Novo Testamento - Gálatas", duration: "13:36" },
      { title: "Teologia do Novo Testamento - Romanos", duration: "13:04" },
      { title: "Teologia do Novo Testamento - Romanos (parte 2)", duration: "13:21" },
      { title: "Teologia do Novo Testamento - Efésios", duration: "12:45" },
      { title: "Teologia do Novo Testamento - Colossenses", duration: "13:13" },
      { title: "Teologia do Novo Testamento - Filipenses", duration: "12:32" },
      { title: "Teologia do Novo Testamento - 1 e 2 Timóteo e Tito", duration: "12:29" },
      { title: "Teologia do Novo Testamento - Tiago", duration: "12:45" },
      { title: "Teologia do Novo Testamento - Hebreus (parte 1)", duration: "12:59" },
      { title: "Teologia do Novo Testamento - Hebreus (parte 2) e 1 Pedro", duration: "13:00" },
      { title: "Teologia do Novo Testamento - 1, 2 e 3 João", duration: "13:23" },
      { title: "Teologia do Novo Testamento - 2 Pedro e Judas", duration: "12:10" },
      { title: "Teologia do Novo Testamento - Apocalipse", duration: "12:53" },
    ],
  },
  {
    title: "Introdução aos Estudos Teológicos",
    description: "Filosofia e sociologia a serviço da teologia",
    durationLabel: "4h14",
    lessons: [
      { title: "Filosofia na Teologia - Introdução aos estudos teológicos", duration: "11:17" },
      { title: "Períodos da Filosofia - Introdução aos Estudos Teológicos", duration: "11:01" },
      { title: "Surgimento da Metafísica - Introdução aos Estudos Teológicos", duration: "11:28" },
      { title: "Itinerário da Metafísica - Introdução aos Estudos Teológicos", duration: "12:45" },
      { title: "Conceito de Metafísica na Teologia Cristã - Introdução aos Estudos Teológicos", duration: "10:14" },
      { title: "Pensamento Moderno - René Descartes - Introdução aos Estudos Teológicos", duration: "12:04" },
      { title: "Provas da existência de Deus - Introdução aos Estudos da Teologia", duration: "11:14" },
      { title: "Se Deus existe, por que há o mal? - Introdução aos Estudos Teológicos", duration: "11:37" },
      { title: "O mal na visão de Santo Agostinho - Introdução aos Estudos Teológicos", duration: "10:23" },
      { title: "O problema do mal - Immanuel Kant - Introdução aos Estudos Teológicos", duration: "10:38" },
      { title: "O problema do mal - Paul Ricoeur - Introdução aos Estudos Teológicos", duration: "11:07" },
      { title: "Existencialismo Cristão - Introdução aos Estudos Teológicos", duration: "11:21" },
      { title: "Sociologia na teologia cristã - Introdução aos Estudos Teológicos", duration: "9:57" },
      { title: "Alta Modernidade - Introdução aos Estudos Teológicos", duration: "9:26" },
      { title: "Análise do Mundo Moderno - Introdução aos Estudos Teológicos", duration: "10:09" },
      { title: "Antropologia - Introdução aos Estudos Teológicos", duration: "8:07" },
      { title: "O surgimento da Sociologia - Introdução aos Estudos Teológicos", duration: "9:25" },
      { title: "Escolas Sociológicas: Francesa e Alemã - Introdução aos Estudos Teológicos", duration: "10:19" },
      { title: "A Sociologia de Émile Durkheim - Introdução aos Estudos Teológicos", duration: "9:37" },
      { title: "A Sociologia de Max Weber - Introdução aos Estudos Teológicos", duration: "10:32" },
      { title: "Protestantismo x Capitalismo - Introdução aos Estudos Teológicos", duration: "10:23" },
      { title: "A religião segundo Émile Durkheim - Introdução aos Estudos Teológicos", duration: "8:57" },
      { title: "Importância da Sociologia - Introdução aos Estudos Teológicos", duration: "10:30" },
      { title: "Necessidade da Teologia no âmbito Social - Introdução aos Estudos Teológicos", duration: "11:17" },
    ],
  },
  {
    title: "Teologia Sistemática I",
    description: "Eclesiologia, soteriologia, hamartiologia, antropologia, angelologia e escatologia",
    durationLabel: "5h02",
    lessons: [
      { title: "Eclesiologia - Doutrina da Igreja (pt. 1) - Teologia Sistemática I", duration: "12:00" },
      { title: "Eclesiologia - Aspectos Universais da Igreja (pt. 2) - Teologia Sistemática I", duration: "11:47" },
      { title: "Eclesiologia - Aspectos inerentes da igreja (pt. 3) - Teologia Sistemática I", duration: "10:58" },
      { title: "Eclesiologia - Templo do Espírito Santo (pt. 4) - Teologia Sistemática I", duration: "13:23" },
      { title: "Soteriologia - Graça de Deus (pt. 1) - Teologia Sistemática I", duration: "11:13" },
      { title: "Soteriologia - Graça revelada em Cristo Jesus (pt. 2) - Teologia Sistemática I", duration: "12:30" },
      { title: "Soteriologia - Iniciativa de Deus (pt. 3) - Teologia Sistemática I", duration: "12:13" },
      { title: "Soteriologia - Início da Salvação (pt. 4) - Teologia Sistemática I", duration: "12:20" },
      { title: "Soteriologia - Justificação (pt. 5) - Teologia Sistemática I", duration: "13:09" },
      { title: "Soteriologia - Consumação (pt. 6) - Teologia Sistemática I", duration: "12:06" },
      { title: "Hamartiologia - Doutrina do Pecado (pt. 1) - Teologia Sistemática I", duration: "12:11" },
      { title: "Hamartiologia - Corrupção herdada (pt. 2) - Teologia Sistemática I", duration: "13:11" },
      { title: "Hamartiologia - Consequências do pecado (pt. 3) - Teologia Sistemática I", duration: "13:36" },
      { title: "Hamartiologia - Dimensão social do pecado (pt. 4) - Teologia Sistemática I", duration: "13:02" },
      { title: "Antropologia - Doutrina do Homem (pt. 1) - Teologia Sistemática I", duration: "12:36" },
      { title: "Antropologia - Valor da humanidade para Deus (pt. 2) - Teologia Sistemática I", duration: "12:45" },
      { title: "Antropologia - Semelhança de Deus (pt. 3) - Teologia Sistemática I", duration: "12:36" },
      { title: "Antropologia - Aspectos mentais do Ser Humano (pt. 4) - Teologia Sistemática I", duration: "13:03" },
      { title: "Angeologia e Demonologia - Doutrina dos anjos e dos demônios - Teologia Sistemática I", duration: "11:38" },
      { title: "Angeologia e Demonologia - Natureza das criaturas angelicais - Teologia Sistemática I", duration: "12:40" },
      { title: "Angeologia e Demonologia - O estudo dos demônios - Teologia Sistemática I", duration: "13:46" },
      { title: "Escatologia - Doutrina das últimas coisas (pt. 1) - Teologia Sistemática I", duration: "10:48" },
      { title: "Escatologia - Ensinamentos de Jesus (pt. 2) - Teologia Sistemática I", duration: "14:18" },
      { title: "Escatologia - Segunda vinda de Jesus (pt. 3) - Teologia Sistemática I", duration: "13:56" },
    ],
  },
  {
    title: "Liderança e Desenvolvimento do Líder",
    description: "Formação de caráter e prática da liderança cristã",
    durationLabel: "5h18",
    lessons: [
      { title: "Liderança e Desenvolvimento do Líder - O que é liderança?", duration: "13:10" },
      { title: "Liderança e Desenvolvimento do Líder - Influências positivas e negativas", duration: "12:50" },
      { title: "Liderança e Desenvolvimento do Líder - Líder da nova realidade", duration: "13:24" },
      { title: "Liderança e Desenvolvimento do Líder - A importância da leitura para o Líder", duration: "13:22" },
      { title: "Liderança e Desenvolvimento do Líder - Desenvolvimento da Liderança", duration: "13:08" },
      { title: "Liderança e Desenvolvimento do Líder - A visão do Líder", duration: "12:57" },
      { title: "Liderança e Desenvolvimento do Líder - A perseverança do Líder", duration: "13:16" },
      { title: "Liderança e Desenvolvimento do Líder - Confiança e visão do Líder", duration: "12:41" },
      { title: "Liderança e Desenvolvimento do Líder - A visão compartilhada do Líder", duration: "13:02" },
      { title: "Liderança e Desenvolvimento do Líder - A colaboração do Líder", duration: "12:46" },
      { title: "Liderança e Desenvolvimento do Líder - O papel do líder", duration: "13:43" },
      { title: "Liderança e Desenvolvimento do Líder - Visão x Divisão", duration: "12:47" },
      { title: "Liderança e Desenvolvimento do Líder - Chamado de Cristo para o líder", duration: "13:04" },
      { title: "Liderança e Desenvolvimento do Líder - O coração do líder", duration: "13:32" },
      { title: "Liderança e Desenvolvimento do Líder - Líder x chefe", duration: "12:56" },
      { title: "Liderança e Desenvolvimento do Líder - Os três tipos de pessoas", duration: "13:14" },
      { title: "Liderança e Desenvolvimento do Líder - As fases da liderança: inverno", duration: "13:21" },
      { title: "Liderança e Desenvolvimento do Líder - As fases da liderança: verão", duration: "13:37" },
      { title: "Liderança e Desenvolvimento do Líder - Determinação do Líder", duration: "13:56" },
      { title: "Liderança e Desenvolvimento do Líder - Frutos da liderança", duration: "13:37" },
      { title: "Liderança e Desenvolvimento do Líder - Ministério do Líder", duration: "13:45" },
      { title: "Liderança e Desenvolvimento do Líder - Qual área o líder deve atuar?", duration: "13:34" },
      { title: "Liderança e Desenvolvimento do Líder - Mentoria para liderança", duration: "13:35" },
      { title: "Liderança e Desenvolvimento do Líder - O legado do Líder", duration: "13:03" },
    ],
  },
  {
    title: "Teologia Sistemática II",
    description: "Teologia própria, cristologia, pneumatologia e bibliologia — J.P Gouvêa e André Castilho",
    durationLabel: "5h21",
    lessons: [
      { title: "Teologia Sistemática II - O conhecimento de Deus | J.P Gouvêa", duration: "13:03" },
      { title: "Teologia Sistemática II - Revelação Especial | J.P Gouvêa", duration: "14:13" },
      { title: "Teologia Sistemática II - A Trindade | J.P Gouvêa", duration: "14:11" },
      { title: "Teologia Sistemática II - A Trindade (parte 2) | J.P Gouvêa", duration: "12:15" },
      { title: "Teologia Sistemática II - A Trindade (parte 3) | J.P Gouvêa", duration: "13:29" },
      { title: "Teologia Sistemática II - A existência de Deus | J.P Gouvêa", duration: "14:14" },
      { title: "Teologia Sistemática II - A proximidade e a distância de Deus | J.P Gouvêa", duration: "13:00" },
      { title: "Teologia Sistemática II - Aspectos Bíblicos da criação | J.P Gouvêa", duration: "12:29" },
      { title: "Teologia Sistemática II - Teologia Própria | J.P Gouvêa", duration: "12:55" },
      { title: "Teologia Sistemática II - Atributos incomunicáveis de Deus | J.P Gouvêa", duration: "13:13" },
      { title: "Teologia Sistemática II - Teodiceia | J.P Gouvêa", duration: "13:06" },
      { title: "Teologia Sistemática II - Centralidade da nossa fé | André Castilho", duration: "14:44" },
      { title: "Teologia Sistemática II - A dupla natureza de Cristo | André Castilho", duration: "13:43" },
      { title: "Teologia Sistemática II - História da Salvação | André Castilho", duration: "14:06" },
      { title: "Teologia Sistemática II - A missão de Jesus na terra | André Castilho", duration: "12:57" },
      { title: "Teologia Sistemática II - A terceira pessoa da Trindade: Espírito Santo | André Castilho", duration: "13:06" },
      { title: "Teologia Sistemática II - A terceira pessoa da Trindade: Espírito Santo (pt. 2) | André Castilho", duration: "13:12" },
      { title: "Teologia Sistemática II - Batismo e plenitude no Espírito Santo | André Castilho", duration: "13:56" },
      { title: "Teologia Sistemática II - Dons do Espírito Santo | André Castilho", duration: "13:00" },
      { title: "Teologia Sistemática II - Bibliologia | André Castilho", duration: "12:16" },
      { title: "Teologia Sistemática II - Bibliologia: Cânons | André Castilho", duration: "12:38" },
      { title: "Teologia Sistemática II - Bibliologia: Bíblia, a palavra de Deus | André Castilho", duration: "13:10" },
      { title: "Teologia Sistemática II - Bibliologia: Objetivo e eficácia das escrituras | André Castilho", duration: "12:48" },
      { title: "Teologia Sistemática - Bibliografia de Teologia Sistemática | J.P e André Castilho", duration: "14:58" },
    ],
  },
  {
    title: "Introdução ao Novo Testamento",
    description: "Estudo livro a livro — Marcos de Almeida",
    durationLabel: "5h56",
    lessons: [
      { title: "Contexto - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:38" },
      { title: "Revolta dos Macabeus - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:27" },
      { title: "Evangelho de Mateus - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:16" },
      { title: "Evangelho de Marcos - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:22" },
      { title: "Evangelho de Lucas - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:16" },
      { title: "Evangelho de João - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:29" },
      { title: "Atos dos Apóstolos - Introdução ao Novo Testamento | Marcos de Almeida", duration: "15:11" },
      { title: "Cartas do Novo Testamento - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:48" },
      { title: "Primeira e Segunda Tessalonicenses - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:38" },
      { title: "Epístola de Paulo aos Romanos - Introdução ao Novo Testamento | Marcos de Almeida", duration: "12:59" },
      { title: "Epístola de Paulo aos Romanos (pt. 2) - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:27" },
      { title: "Primeira carta aos Coríntios - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:20" },
      { title: "Segunda carta aos Coríntios - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:30" },
      { title: "Efésios - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:38" },
      { title: "Filemom e Colossenses - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:54" },
      { title: "Filipenses - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:53" },
      { title: "Primeira carta a Timóteo - Introdução ao Novo Testamento | Marcos de Almeida", duration: "15:43" },
      { title: "Segunda carta a Timóteo - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:29" },
      { title: "Tito - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:16" },
      { title: "Primeira carta de Pedro - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:50" },
      { title: "Segunda carta de Pedro - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:04" },
      { title: "Tiago - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:59" },
      { title: "Hebreus - Introdução ao Novo Testamento | Marcos de Almeida", duration: "13:37" },
      { title: "Primeira, Segunda e Terceira cartas de João - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:40" },
      { title: "Apocalipse - Introdução ao Novo Testamento | Marcos de Almeida", duration: "14:47" },
    ],
  },
];

function buildCatalog(): { modules: AcademyModule[]; lessons: AcademyLesson[] } {
  const modules: AcademyModule[] = [];
  const lessons: AcademyLesson[] = [];
  let globalNumber = 0;

  MODULE_DEFS.forEach((def, moduleIndex) => {
    const moduleId = moduleIndex + 1;
    modules.push({
      id: moduleId,
      title: def.title,
      description: def.description,
      lessonCount: def.lessons.length,
      durationLabel: def.durationLabel,
    });

    def.lessons.forEach((lesson, lessonIndex) => {
      globalNumber += 1;
      lessons.push({
        lessonNumber: globalNumber,
        moduleId,
        lessonInModule: lessonIndex + 1,
        title: lesson.title,
        duration: lesson.duration,
      });
    });
  });

  return { modules, lessons };
}

const { modules: ACADEMY_MODULES, lessons: ACADEMY_LESSONS } = buildCatalog();

export const ACADEMY_COURSE: AcademyCourse = {
  id: COURSE_ID,
  title: "Curso Básico de Teologia",
  channel: RTM_CHANNEL_NAME,
  channelUrl: RTM_CHANNEL_URL,
  playlistUrl: RTM_PLAYLIST_URL,
  totalLessons: ACADEMY_LESSONS.length,
  totalModules: ACADEMY_MODULES.length,
  durationLabel: "56h37",
};

export function listModules(): AcademyModule[] {
  return ACADEMY_MODULES;
}

export function getModule(moduleId: number): AcademyModule | null {
  return ACADEMY_MODULES.find((m) => m.id === moduleId) ?? null;
}

export function listModuleLessons(moduleId: number): AcademyLesson[] {
  return ACADEMY_LESSONS.filter((l) => l.moduleId === moduleId);
}

export function getLesson(moduleId: number, lessonInModule: number): AcademyLesson | null {
  return (
    ACADEMY_LESSONS.find(
      (l) => l.moduleId === moduleId && l.lessonInModule === lessonInModule,
    ) ?? null
  );
}

export function getLessonByGlobalNumber(lessonNumber: number): AcademyLesson | null {
  return ACADEMY_LESSONS.find((l) => l.lessonNumber === lessonNumber) ?? null;
}

export function getAdjacentLessons(lessonNumber: number): {
  previous: AcademyLesson | null;
  next: AcademyLesson | null;
} {
  return {
    previous: getLessonByGlobalNumber(lessonNumber - 1),
    next: getLessonByGlobalNumber(lessonNumber + 1),
  };
}

// URL do embed oficial do YouTube para a playlist, posicionado na aula
// (index é 0-based na API do YouTube; lessonNumber é 1-based aqui).
export function getLessonEmbedUrl(lessonNumber: number): string {
  return `https://www.youtube.com/embed/videoseries?list=${RTM_PLAYLIST_ID}&index=${lessonNumber - 1}`;
}

// Mesma lógica, mas para o link "Assistir no YouTube" (abre no site/app
// do YouTube, na posição certa da playlist real).
export function getLessonWatchUrl(lessonNumber: number): string {
  return `https://www.youtube.com/watch?list=${RTM_PLAYLIST_ID}&index=${lessonNumber - 1}`;
}
