import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const admin = createClient(url, serviceKey);

const outlines = [
  {
    slug: "a-fe-que-nao-se-abala",
    title: "A Fé que Não Se Abala",
    base_text: "Hebreus 11:1-6",
    category_id: "fe",
    testament: "NT",
    short_description:
      "Um estudo sobre a natureza da fé genuína e por que ela agrada a Deus mesmo sem ver o resultado final.",
    central_idea:
      "A fé verdadeira crê em Deus antes de ver a resposta, porque descansa em quem Ele é, não nas circunstâncias.",
    short_introduction:
      "Hebreus define a fé como a certeza do que se espera e a prova das coisas que não se veem. Numa época que só confia no que pode comprovar, a fé bíblica é um contraste radical — e é exatamente isso que agrada a Deus.",
    points: [
      {
        title: "A Fé Vê o Invisível",
        bullets: [
          "Pela fé entendemos que o universo foi formado pela Palavra de Deus",
          "O que se vê não veio do que se pode ver",
          "Fé não é ausência de razão, é confiança numa realidade maior",
        ],
      },
      {
        title: "A Fé Busca a Deus Sinceramente",
        bullets: [
          "Sem fé é impossível agradar a Deus",
          "É necessário crer que Ele existe e que recompensa os que o buscam",
          "Buscar a Deus é uma decisão diária, não um sentimento ocasional",
        ],
      },
      {
        title: "A Fé Resiste ao Tempo",
        bullets: [
          "Os heróis da fé em Hebreus 11 muitas vezes não viram o cumprimento em vida",
          "A fé sustenta mesmo quando a resposta demora",
          "Perseverar na fé é confiar no caráter de Deus, não no cronograma",
        ],
      },
    ],
    applications: [
      "Escreva uma promessa de Deus que você está esperando ver cumprida e agradeça por ela hoje, antes mesmo de vê-la.",
      "Identifique uma área em que você tem confiado mais no que vê do que em Deus, e entregue isso a Ele em oração.",
    ],
    conclusion_appeal:
      "Você está disposto a confiar em Deus mesmo sem ver o final da história? A fé que agrada a Deus começa exatamente aí.",
  },
  {
    slug: "vencendo-o-gigante-do-medo",
    title: "Vencendo o Gigante do Medo",
    base_text: "Números 13:30-33",
    category_id: "fe",
    testament: "AT",
    short_description:
      "Por que dez espias viram gigantes e Josué e Calebe viram a promessa de Deus — a mesma terra, óticas diferentes.",
    central_idea: "O medo aumenta o tamanho do problema; a fé aumenta o tamanho de Deus.",
    short_introduction:
      "Doze espias viram a mesma terra prometida. Dez voltaram paralisados pelo medo; dois voltaram cheios de fé. A diferença não estava na terra, mas na forma como cada um enxergava a Deus diante do gigante.",
    points: [
      {
        title: "O Relatório do Medo",
        bullets: [
          "Dez espias focaram no tamanho dos gigantes, não no tamanho de Deus",
          "O medo espalha desânimo por toda a comunidade",
          "Uma má perspectiva pode transformar uma promessa em ameaça",
        ],
      },
      {
        title: "O Relatório da Fé",
        bullets: [
          "Calebe disse: 'Subamos e a possuamos, porque bem poderemos'",
          "Josué e Calebe viram os mesmos gigantes, mas confiaram na promessa de Deus",
          "A fé não nega o desafio, mas recusa deixar o desafio ter a última palavra",
        ],
      },
      {
        title: "O Preço da Descrença",
        bullets: [
          "A geração do medo não entrou na terra prometida",
          "A murmuração e o medo têm consequências reais",
          "Só Josué e Calebe, os que creram, viram a promessa se cumprir",
        ],
      },
    ],
    applications: [
      "Identifique o 'gigante' que tem paralisado sua fé essa semana e escreva ao lado dele uma promessa de Deus maior que ele.",
      "Escolha hoje falar como Calebe — de fé — em vez de repetir o relatório do medo.",
    ],
    conclusion_appeal:
      "Os gigantes na sua frente são reais, mas o Deus que está com você é maior. Que relatório você vai dar hoje?",
  },
  {
    slug: "quando-deus-parece-estar-em-silencio",
    title: "Quando Deus Parece Estar em Silêncio",
    base_text: "Salmos 13:1-6",
    category_id: "fe",
    testament: "AT",
    short_description:
      "Como lidar com os momentos em que a resposta de Deus demora e o coração começa a duvidar.",
    central_idea:
      "É possível lamentar honestamente diante de Deus e, ainda assim, terminar em confiança e louvor.",
    short_introduction:
      "'Até quando, Senhor?' Davi faz essa pergunta quatro vezes no início do Salmo 13. Ele não esconde a angústia — mas também não termina nela. Esse salmo ensina que o silêncio de Deus não é o fim da fé, mas um convite a confiar mais fundo.",
    points: [
      {
        title: "A Honestidade do Lamento",
        bullets: [
          "Davi expressa abertamente sua dor e frustração diante de Deus",
          "Lamentar não é falta de fé, é fé que se recusa a fingir",
          "Deus recebe nossas perguntas mais difíceis sem se ofender",
        ],
      },
      {
        title: "A Oração no Meio da Espera",
        bullets: [
          "Davi pede: 'Considera, ouve-me, Senhor meu Deus'",
          "Orar em meio à dúvida é mais saudável do que se calar diante de Deus",
          "A espera é o espaço onde a fé é refinada",
        ],
      },
      {
        title: "A Virada da Confiança",
        bullets: [
          "O salmo termina com 'eu, porém, confio na tua misericórdia'",
          "A confiança não depende de a resposta já ter chegado",
          "Louvar antes da resposta é um ato de fé madura",
        ],
      },
    ],
    applications: [
      "Escreva seu próprio 'até quando, Senhor?' num papel e, embaixo, escreva uma razão para confiar nEle mesmo assim.",
      "Ore hoje sem filtrar sua dor — e termine agradecendo por quem Deus é.",
    ],
    conclusion_appeal:
      "Se você está numa espera silenciosa, você não está sozinho. Traga sua dor a Deus e escolha confiar, como Davi escolheu.",
  },
  {
    slug: "a-fe-de-quem-nao-viu-e-creu",
    title: "A Fé de Quem Não Viu e Creu",
    base_text: "João 20:24-29",
    category_id: "fe",
    testament: "NT",
    short_description:
      "A história de Tomé mostra que dúvidas sinceras podem se transformar na confissão de fé mais profunda.",
    central_idea:
      "Bem-aventurados os que não viram e creram — a fé madura confia mesmo sem ter todas as provas.",
    short_introduction:
      "Tomé não estava presente quando Jesus apareceu aos discípulos pela primeira vez, e se recusou a crer sem ver. Uma semana depois, Jesus veio até ele — e a resposta de Tomé se tornou uma das maiores confissões de fé do Evangelho.",
    points: [
      {
        title: "A Dúvida Sincera de Tomé",
        bullets: [
          "Tomé não queria fingir uma fé que não tinha",
          "Sua dúvida não o afastou da comunidade dos discípulos",
          "Deus não rejeita quem busca honestamente antes de crer",
        ],
      },
      {
        title: "O Encontro que Transforma",
        bullets: [
          "Jesus vai ao encontro de Tomé mesmo com sua condição",
          "Jesus se mostra disposto a atender às nossas fraquezas",
          "O encontro pessoal com Cristo dissolve dúvidas que argumentos não resolvem",
        ],
      },
      {
        title: "A Fé que Não Depende de Ver",
        bullets: [
          "Tomé confessa: 'Senhor meu, e Deus meu'",
          "Jesus declara bem-aventurados os que creem sem ver",
          "Nossa fé hoje se apoia no testemunho, não na visão física",
        ],
      },
    ],
    applications: [
      "Traga sua dúvida sincera a Deus em oração em vez de escondê-la ou fingir que não existe.",
      "Agradeça a Deus por uma vez em que Ele confirmou Sua presença mesmo sem uma prova visível.",
    ],
    conclusion_appeal:
      "Você não precisa ver para crer. Traga sua dúvida a Jesus — Ele vai ao seu encontro, como foi ao encontro de Tomé.",
  },
  {
    slug: "pais-que-deixam-um-legado-de-fe",
    title: "Pais que Deixam um Legado de Fé",
    base_text: "Deuteronômio 6:4-9",
    category_id: "familia",
    testament: "AT",
    short_description:
      "Como transformar a fé em algo vivido e ensinado no dia a dia da casa, não só nos domingos.",
    central_idea:
      "Ensinar a Deus aos filhos não é um evento, é um estilo de vida praticado em cada momento do lar.",
    short_introduction:
      "Moisés instrui Israel a gravar a Palavra de Deus no coração e ensiná-la aos filhos 'assentado em casa, andando pelo caminho, ao deitar-se e ao levantar-se'. A fé que marca gerações não é ensinada apenas com palavras, mas vivida diante dos filhos todos os dias.",
    points: [
      {
        title: "Primeiro no Coração dos Pais",
        bullets: [
          "A Palavra precisa estar no coração de quem ensina antes de estar na boca",
          "Não se transmite o que não se possui",
          "A fé autêntica dos pais é o primeiro sermão que os filhos veem",
        ],
      },
      {
        title: "Ensino Contínuo, Não Ocasional",
        bullets: [
          "'Ensinarás com diligência' aponta para repetição, não para um evento único",
          "As conversas comuns do dia a dia são oportunidades de ensino espiritual",
          "A fé se transmite mais em conversas informais do que em discursos formais",
        ],
      },
      {
        title: "Marcas Visíveis em Toda a Casa",
        bullets: [
          "Israel foi instruído a marcar portas e mãos com a Palavra",
          "O ambiente da casa deve refletir os valores que se quer ensinar",
          "O que é visível e repetido molda a memória e o caráter dos filhos",
        ],
      },
    ],
    applications: [
      "Escolha um momento fixo do dia (refeição, trajeto, antes de dormir) para conversar sobre Deus com sua família.",
      "Avalie se o que você vive em casa combina com o que você ensina sobre fé aos seus filhos.",
    ],
    conclusion_appeal:
      "O maior legado que você pode deixar não é financeiro, é espiritual. Comece hoje a ensinar com o exemplo e com a palavra.",
  },
  {
    slug: "o-casamento-segundo-o-proposito-de-deus",
    title: "O Casamento Segundo o Propósito de Deus",
    base_text: "Efésios 5:21-33",
    category_id: "familia",
    testament: "NT",
    short_description:
      "Um esboço sobre amor, submissão mútua e sacrifício como fundamento de um casamento saudável.",
    central_idea:
      "O casamento cristão reflete o amor de Cristo pela igreja: um amor que serve, sacrifica e honra.",
    short_introduction:
      "Paulo não descreve o casamento como uma relação de poder, mas como um retrato vivo do evangelho: Cristo que ama e se entrega pela igreja, e a igreja que responde com confiança. É esse padrão que deve moldar cada casamento cristão.",
    points: [
      {
        title: "Submissão Mútua em Amor",
        bullets: [
          "Efésios 5:21 chama todos a se sujeitarem uns aos outros",
          "Submissão bíblica não é inferioridade, é colocar o outro em primeiro lugar",
          "Um casamento saudável tem duas pessoas servindo, não uma dominando",
        ],
      },
      {
        title: "Amor que se Entrega",
        bullets: [
          "Maridos são chamados a amar como Cristo amou a igreja — até a entrega total",
          "Amor bíblico é decisão e ação, não apenas sentimento",
          "Amar sacrificialmente cria segurança emocional no lar",
        ],
      },
      {
        title: "Honra que Fortalece",
        bullets: [
          "A esposa é chamada a respeitar e confiar na liderança servidora do marido",
          "Honra mútua substitui a competição pelo controle",
          "Um lar honesto sobre suas falhas e generoso no perdão dura mais",
        ],
      },
    ],
    applications: [
      "Converse com seu cônjuge sobre uma forma prática de servi-lo(a) melhor essa semana.",
      "Peça perdão por uma área em que você tem exigido submissão sem oferecer amor sacrificial.",
    ],
    conclusion_appeal:
      "O casamento não é sobre quem manda, é sobre quem serve. Deixe o amor de Cristo moldar o seu lar hoje.",
  },
  {
    slug: "honrando-pai-e-mae",
    title: "Honrando Pai e Mãe",
    base_text: "Efésios 6:1-3",
    category_id: "familia",
    testament: "NT",
    short_description:
      "O único mandamento com promessa: por que honrar pais tem impacto direto sobre nossa vida.",
    central_idea:
      "Honrar pai e mãe é um mandamento com promessa de bênção que atravessa todas as fases da vida.",
    short_introduction:
      "Paulo lembra aos efésios que honrar pai e mãe é 'o primeiro mandamento com promessa'. Não se trata apenas de obediência na infância, mas de uma atitude de honra que continua mesmo quando já somos adultos.",
    points: [
      {
        title: "Obediência na Infância",
        bullets: [
          "Filhos são chamados a obedecer aos pais no Senhor",
          "Obedecer aos pais é uma forma de aprender a confiar em Deus",
          "A obediência na infância prepara o caráter para a vida adulta",
        ],
      },
      {
        title: "Honra na Vida Adulta",
        bullets: [
          "Honrar vai além de obedecer — envolve respeito e cuidado contínuo",
          "Jesus repreendeu quem usava tradições religiosas para negligenciar os pais",
          "Cuidar dos pais idosos é uma extensão prática da honra",
        ],
      },
      {
        title: "A Promessa Ligada ao Mandamento",
        bullets: [
          "'Para que te vá bem e sejas de longa vida sobre a terra'",
          "Honrar os pais estabelece um padrão de respeito à autoridade",
          "Famílias que praticam honra geram estabilidade entre gerações",
        ],
      },
    ],
    applications: [
      "Faça hoje um gesto concreto de honra aos seus pais (ligação, visita, palavra de gratidão), mesmo que a relação não seja perfeita.",
      "Se você é pai ou mãe, avalie se sua forma de exercer autoridade convida à honra ou ao ressentimento.",
    ],
    conclusion_appeal:
      "Honrar pai e mãe não tem prazo de validade. Que atitude de honra você pode praticar ainda hoje?",
  },
  {
    slug: "a-familia-que-serve-ao-senhor",
    title: "A Família Que Serve ao Senhor",
    base_text: "Josué 24:14-15",
    category_id: "familia",
    testament: "AT",
    short_description:
      "A decisão de Josué de que sua casa serviria ao Senhor, independente do que o restante do povo escolhesse.",
    central_idea:
      "Servir ao Senhor é uma decisão que cada família precisa tomar, mesmo quando ao redor as escolhas são outras.",
    short_introduction:
      "Diante de Israel, no fim de sua vida, Josué convoca o povo a escolher a quem servir — e declara, sem hesitação, que ele e sua casa servirão ao Senhor. Essa é a base de toda família que deseja deixar um legado espiritual.",
    points: [
      {
        title: "A Decisão é Pessoal e Familiar",
        bullets: [
          "Josué não impõe a escolha a Israel, mas define a direção da própria casa",
          "Cada família precisa decidir conscientemente a quem vai servir",
          "A neutralidade espiritual no lar sempre favorece o mundo, não a Deus",
        ],
      },
      {
        title: "Escolher Apesar do Ambiente",
        bullets: [
          "Josué fala isso cercado de povos que serviam outros deuses",
          "A cultura ao redor não determina os valores da sua casa",
          "Famílias fiéis muitas vezes remam contra a maioria",
        ],
      },
      {
        title: "Uma Declaração que Ecoa Gerações",
        bullets: [
          "A decisão de Josué se tornou referência para Israel por gerações",
          "O que uma família decide hoje impacta os que vêm depois",
          "Servir ao Senhor precisa ser reafirmado, não apenas herdado",
        ],
      },
    ],
    applications: [
      "Reúna sua família e declare, em voz alta, a decisão de servir ao Senhor juntos.",
      "Identifique uma influência do ambiente que tem puxado sua casa para longe de Deus e trate disso esta semana.",
    ],
    conclusion_appeal:
      "Você já escolheu a quem sua casa vai servir? Hoje é um bom dia para declarar, como Josué: eu e a minha casa serviremos ao Senhor.",
  },
  {
    slug: "educando-filhos-no-caminho-certo",
    title: "Educando Filhos no Caminho Certo",
    base_text: "Provérbios 22:6",
    category_id: "familia",
    testament: "AT",
    short_description:
      "Como a sabedoria de Provérbios orienta pais a formar o caráter dos filhos com intencionalidade.",
    central_idea:
      "Educar um filho no caminho certo exige direção intencional, paciência e confiança na fidelidade de Deus a longo prazo.",
    short_introduction:
      "'Ensina a criança no caminho em que deve andar, e, ainda quando for velho, não se desviará dele.' Esse provérbio não é uma fórmula mágica, mas um princípio: a formação do caráter começa cedo e produz frutos que só o tempo revela.",
    points: [
      {
        title: "Conhecer o Caminho da Criança",
        bullets: [
          "O texto sugere considerar a vocação e a natureza de cada filho",
          "Educar não é impor um único molde a todos os filhos",
          "Observar e entender o filho é o primeiro passo para orientá-lo bem",
        ],
      },
      {
        title: "Ensinar com Intencionalidade",
        bullets: [
          "Educação espiritual e de caráter não acontece por acidente",
          "Requer tempo investido, exemplo e correção amorosa",
          "Pais que não ensinam deixam espaço para que outras vozes ensinem",
        ],
      },
      {
        title: "Confiar no Processo a Longo Prazo",
        bullets: [
          "A promessa fala de um fruto que aparece mesmo quando o filho for velho",
          "Sementes plantadas na infância podem levar anos para florescer",
          "Pais não devem desanimar diante de fases difíceis dos filhos",
        ],
      },
    ],
    applications: [
      "Identifique um traço de caráter que você quer intencionalmente cultivar no seu filho este mês.",
      "Ore hoje pelo caminho de cada um dos seus filhos, confiando que Deus continua trabalhando mesmo quando você não vê resultado imediato.",
    ],
    conclusion_appeal:
      "A educação que você investe hoje pode não florescer amanhã, mas Deus é fiel para completar a obra. Continue plantando.",
  },
  {
    slug: "orando-sem-cessar",
    title: "Orando sem Cessar",
    base_text: "1 Tessalonicenses 5:16-18",
    category_id: "oracao",
    testament: "NT",
    short_description:
      "O convite de Paulo a fazer da oração um estilo de vida, não apenas um momento pontual do dia.",
    central_idea:
      "Orar sem cessar é viver em comunhão constante com Deus, e não apenas reservar um horário fixo para Ele.",
    short_introduction:
      "'Orai sem cessar' pode parecer impossível numa rotina cheia. Mas Paulo não fala de um ato isolado — fala de uma atitude constante de dependência de Deus em meio à vida real, com alegria e gratidão.",
    points: [
      {
        title: "Alegrai-vos Sempre",
        bullets: [
          "A alegria cristã não depende das circunstâncias",
          "Alegrar-se no Senhor é uma escolha diária, não um sentimento espontâneo",
          "A alegria constante nasce da certeza de que Deus está no controle",
        ],
      },
      {
        title: "Orai sem Cessar",
        bullets: [
          "Orar constantemente é manter o coração voltado para Deus durante o dia",
          "Pequenas orações silenciosas ao longo da rotina cultivam intimidade com Deus",
          "A oração contínua transforma tarefas comuns em momentos de comunhão",
        ],
      },
      {
        title: "Em Tudo Dai Graças",
        bullets: [
          "Gratidão em tudo não significa agradecer pelo mal, mas confiar em Deus nele",
          "Esta é a vontade de Deus para nós em Cristo Jesus",
          "Um coração grato tem menos espaço para ansiedade",
        ],
      },
    ],
    applications: [
      "Escolha três momentos do seu dia de amanhã para fazer uma oração curta, mesmo em meio às tarefas.",
      "Antes de dormir hoje, liste três coisas pelas quais você pode agradecer a Deus, mesmo em meio às dificuldades da semana.",
    ],
    conclusion_appeal:
      "Você não precisa esperar o culto de domingo para falar com Deus. Comece agora — em qualquer lugar, em qualquer momento.",
  },
  {
    slug: "a-oracao-que-move-a-mao-de-deus",
    title: "A Oração que Move a Mão de Deus",
    base_text: "Tiago 5:13-16",
    category_id: "oracao",
    testament: "NT",
    short_description:
      "Tiago ensina sobre a eficácia da oração ferviente do justo diante de doença, pecado e necessidade.",
    central_idea:
      "A oração fervorosa e sincera do justo pode muito em seus efeitos — Deus responde a quem clama de coração.",
    short_introduction:
      "Tiago conecta a oração a situações concretas: sofrimento, alegria, enfermidade e pecado. Ele não apresenta a oração como um ritual distante, mas como uma resposta prática e poderosa para cada momento da vida.",
    points: [
      {
        title: "Oração em Todas as Circunstâncias",
        bullets: [
          "Sofrendo alguém? Ore. Estando alegre? Cante louvores",
          "A oração é resposta tanto para a dor quanto para a alegria",
          "Não existe situação de vida fora do alcance da oração",
        ],
      },
      {
        title: "Oração em Comunidade",
        bullets: [
          "Tiago recomenda chamar os presbíteros da igreja para orar pelos enfermos",
          "A oração não precisa ser solitária — o corpo de Cristo ora junto",
          "Confessar as faltas uns aos outros e orar uns pelos outros traz cura",
        ],
      },
      {
        title: "O Poder da Oração do Justo",
        bullets: [
          "'A oração feita por fé salvará o doente'",
          "A oração ferviente do justo pode muito em seus efeitos",
          "Elias, um homem como nós, orou e o céu respondeu",
        ],
      },
    ],
    applications: [
      "Peça a alguém de confiança na sua igreja para orar com você por uma necessidade específica esta semana.",
      "Se você guarda um pecado em segredo, considere confessá-lo a alguém de confiança e orar junto por libertação.",
    ],
    conclusion_appeal:
      "A oração não é o último recurso, é a primeira resposta. O que você precisa levar a Deus hoje, em comunidade?",
  },
  {
    slug: "getsemani-oracao-em-meio-a-angustia",
    title: "Getsêmani: Oração em Meio à Angústia",
    base_text: "Mateus 26:36-39",
    category_id: "oracao",
    testament: "NT",
    short_description:
      "Como Jesus enfrentou a angústia mais profunda de Sua vida através da oração sincera ao Pai.",
    central_idea:
      "A oração verdadeira não esconde a angústia — ela a entrega ao Pai e se rende à Sua vontade.",
    short_introduction:
      "No Getsêmani, Jesus experimentou uma angústia tão profunda que suou como gotas de sangue. Mesmo assim, Ele não deixou de orar — pelo contrário, foi na oração que encontrou forças para seguir até a cruz.",
    points: [
      {
        title: "A Honestidade da Angústia",
        bullets: [
          "Jesus disse: 'a minha alma está profundamente triste até à morte'",
          "Ele não escondeu Sua dor do Pai nem dos discípulos",
          "Orar com honestidade sobre nossa dor é bíblico, não é falta de fé",
        ],
      },
      {
        title: "O Pedido Sincero",
        bullets: [
          "Jesus pediu: 'Passa de mim este cálice'",
          "É legítimo pedir a Deus alívio diante do sofrimento",
          "Orar sinceramente inclui expressar o que realmente desejamos",
        ],
      },
      {
        title: "A Entrega Final",
        bullets: [
          "'Todavia, não seja como eu quero, mas como tu queres'",
          "A oração madura termina em submissão à vontade de Deus",
          "A entrega não elimina a dor, mas traz a paz para atravessá-la",
        ],
      },
    ],
    applications: [
      "Leve hoje ao Pai, com total honestidade, a angústia que você tem escondido ou minimizado.",
      "Termine sua oração de hoje com a mesma entrega de Jesus: 'seja feita a Tua vontade'.",
    ],
    conclusion_appeal:
      "Você não precisa fingir força diante de Deus. Leve sua angústia ao Getsêmani da oração e encontre força para seguir.",
  },
  {
    slug: "ana-e-a-oracao-da-alma-amargurada",
    title: "Ana e a Oração da Alma Amargurada",
    base_text: "1 Samuel 1:10-18",
    category_id: "oracao",
    testament: "AT",
    short_description:
      "A oração de Ana, feita em profunda angústia de alma, mostra que Deus ouve até as orações sem palavras.",
    central_idea:
      "Deus ouve a oração sincera, mesmo quando ela vem misturada de lágrimas e não tem palavras perfeitas.",
    short_introduction:
      "Estéril e angustiada, Ana orou de coração tão profundo que Eli pensou que ela estivesse embriagada. Sua história mostra que Deus valoriza a sinceridade da oração mais do que a eloquência das palavras.",
    points: [
      {
        title: "A Dor Levada ao Templo",
        bullets: [
          "Ana não escondeu sua tristeza; foi diretamente à presença de Deus com ela",
          "Levar a dor ao lugar certo é mais saudável do que guardá-la sozinha",
          "O templo (ou o lugar de oração) é espaço seguro para a alma angustiada",
        ],
      },
      {
        title: "A Oração de Alma Amargurada",
        bullets: [
          "Ana orou 'com amargura de alma', chorando muito",
          "Deus não exige que escondamos nossas emoções para orar",
          "Orações imperfeitas em forma ainda são poderosas em sinceridade",
        ],
      },
      {
        title: "A Resposta e a Gratidão",
        bullets: [
          "Ana recebeu a paz de Eli e, depois, a resposta de Deus",
          "Ela cumpriu o voto de dedicar o filho ao Senhor",
          "A gratidão de Ana virou um cântico de louvor registrado nas Escrituras",
        ],
      },
    ],
    applications: [
      "Se você carrega uma dor antiga sem nunca tê-la levado a Deus em oração, faça isso hoje, sem filtros.",
      "Releia a oração de Ana (1 Samuel 2:1-10) como modelo de gratidão após uma resposta de Deus.",
    ],
    conclusion_appeal:
      "Deus vê além das suas palavras — Ele enxerga o coração. Leve sua amargura a Ele hoje, como Ana levou a dela.",
  },
  {
    slug: "elias-e-o-poder-da-oracao-persistente",
    title: "Elias e o Poder da Oração Persistente",
    base_text: "1 Reis 18:41-45",
    category_id: "oracao",
    testament: "AT",
    short_description:
      "Elias orou sete vezes até ver a nuvem de chuva aparecer — um exemplo de persistência na oração.",
    central_idea:
      "A oração persistente não é falta de fé, é expressão de fé que continua buscando até ver a resposta de Deus.",
    short_introduction:
      "Depois de vencer os profetas de Baal, Elias sobe ao monte e ora por chuva — mas não desiste na primeira tentativa. Ele ora, manda verificar, e ora de novo, sete vezes, até que a nuvem finalmente aparece.",
    points: [
      {
        title: "A Promessa Já Estava Dada",
        bullets: [
          "Deus já havia dito que enviaria chuva antes de Elias orar",
          "Mesmo com a promessa certa, Elias ainda precisou orar com intensidade",
          "Conhecer a vontade de Deus não elimina a necessidade de orar por ela",
        ],
      },
      {
        title: "A Persistência na Espera",
        bullets: [
          "Elias orou sete vezes, sem desistir diante do silêncio inicial",
          "A persistência na oração revela confiança, não desespero",
          "Tiago lembra que Elias era 'homem sujeito às mesmas paixões que nós'",
        ],
      },
      {
        title: "A Resposta que Chega no Tempo de Deus",
        bullets: [
          "Na sétima vez, surgiu uma nuvem do tamanho da mão de um homem",
          "Pequenos sinais de resposta merecem ser reconhecidos e celebrados",
          "A chuva forte veio logo depois do pequeno sinal",
        ],
      },
    ],
    applications: [
      "Continue orando por aquele pedido que parece não ter resposta ainda — não desista na primeira tentativa.",
      "Esteja atento a pequenos sinais de que Deus está respondendo, mesmo antes da resposta completa chegar.",
    ],
    conclusion_appeal:
      "Se Elias, um homem como nós, orou sete vezes até ver a resposta, você também pode perseverar. Continue orando.",
  },
  {
    slug: "o-consolador-prometido",
    title: "O Consolador Prometido",
    base_text: "João 14:16-18,26",
    category_id: "espirito-santo",
    testament: "NT",
    short_description:
      "Jesus promete que não deixaria Seus discípulos órfãos — o Espírito Santo viria para consolar e ensinar.",
    central_idea:
      "O Espírito Santo é o Consolador prometido por Jesus para que nunca estivéssemos espiritualmente sozinhos.",
    short_introduction:
      "Diante da despedida iminente, Jesus consola os discípulos com uma promessa: Ele não os deixaria órfãos. O Espírito Santo viria para habitar neles, ensiná-los e lembrá-los de tudo o que Jesus havia dito.",
    points: [
      {
        title: "Uma Promessa de Presença Constante",
        bullets: [
          "'Não vos deixarei órfãos; voltarei para vós'",
          "O Espírito Santo garante a presença de Deus habitando em cada crente",
          "Nunca estamos espiritualmente abandonados",
        ],
      },
      {
        title: "Um Ensinador Fiel",
        bullets: [
          "O Espírito Santo ensina todas as coisas",
          "Ele nos faz lembrar das palavras e dos ensinos de Jesus",
          "A compreensão espiritual profunda vem pela obra do Espírito, não só do esforço humano",
        ],
      },
      {
        title: "Um Consolo em Tempos de Aflição",
        bullets: [
          "A palavra 'Consolador' descreve alguém chamado para estar ao lado",
          "O Espírito nos fortalece em momentos de fraqueza e tristeza",
          "Sua presença traz paz mesmo em circunstâncias adversas",
        ],
      },
    ],
    applications: [
      "Ore pedindo que o Espírito Santo te ensine algo específico das Escrituras esta semana.",
      "Reconheça hoje que você não está sozinho — convide conscientemente a presença do Espírito para o seu dia.",
    ],
    conclusion_appeal:
      "Você não foi deixado órfão. O Consolador prometido habita em você — viva na consciência dessa presença hoje.",
  },
  {
    slug: "andando-no-espirito-nao-na-carne",
    title: "Andando no Espírito, Não na Carne",
    base_text: "Romanos 8:1-6",
    category_id: "espirito-santo",
    testament: "NT",
    short_description:
      "Paulo contrasta a mente controlada pela carne com a mente controlada pelo Espírito — vida e paz versus morte.",
    central_idea:
      "Viver segundo o Espírito, e não segundo a carne, é o caminho para a vida e a paz verdadeiras.",
    short_introduction:
      "Paulo declara que não há condenação para os que estão em Cristo, e explica o motivo: eles andam segundo o Espírito, não segundo a carne. Essa é uma escolha diária que molda toda a vida cristã.",
    points: [
      {
        title: "Nenhuma Condenação em Cristo",
        bullets: [
          "A obra de Cristo nos libertou da lei do pecado e da morte",
          "Nossa identidade em Cristo não depende da nossa perfeição",
          "Sabemos que somos livres, mas ainda escolhemos como viver",
        ],
      },
      {
        title: "Duas Mentes, Dois Caminhos",
        bullets: [
          "A mente da carne busca satisfazer desejos egoístas",
          "A mente do Espírito busca as coisas de Deus",
          "O que ocupa nossa mente determina a direção da nossa vida",
        ],
      },
      {
        title: "O Resultado de Cada Escolha",
        bullets: [
          "A mentalidade da carne resulta em morte espiritual",
          "A mentalidade do Espírito resulta em vida e paz",
          "Cada decisão diária alimenta uma dessas duas mentalidades",
        ],
      },
    ],
    applications: [
      "Identifique um hábito ou pensamento que alimenta a 'mente da carne' em você e substitua-o por algo que alimente a mente do Espírito.",
      "Escolha hoje conscientemente o que vai ocupar sua mente: as coisas de Deus ou os desejos passageiros.",
    ],
    conclusion_appeal: "A vida e a paz estão do lado do Espírito. Que mente você vai alimentar hoje?",
  },
  {
    slug: "os-dons-do-espirito-a-servico-da-igreja",
    title: "Os Dons do Espírito a Serviço da Igreja",
    base_text: "1 Coríntios 12:4-11",
    category_id: "espirito-santo",
    testament: "NT",
    short_description:
      "Diversos dons, o mesmo Espírito — como cada dom espiritual serve ao propósito comum da igreja.",
    central_idea:
      "Os dons espirituais não existem para exaltar quem os recebe, mas para edificar o corpo de Cristo em unidade.",
    short_introduction:
      "Paulo ensina aos coríntios que há diversidade de dons, mas o mesmo Espírito os distribui a cada um como quer, sempre visando o bem comum. Nenhum dom é maior que o propósito de servir ao corpo de Cristo.",
    points: [
      {
        title: "Diversidade com uma Só Fonte",
        bullets: [
          "Há diversidade de dons, ministérios e operações, mas um só Espírito",
          "A variedade de dons reflete a criatividade de Deus, não hierarquia de valor",
          "Nenhum dom é mais 'espiritual' que outro aos olhos de Deus",
        ],
      },
      {
        title: "Dons Distribuídos com Propósito",
        bullets: [
          "Cada dom é dado 'para o que é útil'",
          "O Espírito distribui a cada um individualmente como quer",
          "Não existe dom concedido apenas para benefício próprio",
        ],
      },
      {
        title: "O Bem Comum como Alvo",
        bullets: [
          "Todos os dons servem à edificação do corpo de Cristo",
          "Competição por reconhecimento contraria o propósito dos dons",
          "A igreja funciona bem quando cada dom serve ao todo, não a si mesmo",
        ],
      },
    ],
    applications: [
      "Identifique um dom espiritual que você tem e pergunte a Deus como usá-lo para servir sua igreja esta semana.",
      "Ore por um irmão ou irmã cujo dom você reconhece, agradecendo a Deus pela diversidade do corpo.",
    ],
    conclusion_appeal:
      "Seu dom não é para você brilhar sozinho, é para servir ao corpo de Cristo. Como você vai usá-lo esta semana?",
  },
  {
    slug: "nao-entristecais-o-espirito-santo",
    title: "Não Entristeçais o Espírito Santo",
    base_text: "Efésios 4:30",
    category_id: "espirito-santo",
    testament: "NT",
    short_description:
      "Paulo alerta que nossas atitudes podem entristecer o Espírito Santo que habita em nós, selados para o dia da redenção.",
    central_idea:
      "O Espírito Santo não é apenas poder para usar, é uma pessoa que habita em nós e pode ser entristecida por nossas atitudes.",
    short_introduction:
      "'Não entristeçais o Espírito Santo de Deus, no qual estais selados para o dia da redenção.' Paulo trata o Espírito como alguém com quem temos um relacionamento real — e esse relacionamento pode ser ferido pelas nossas escolhas.",
    points: [
      {
        title: "O Espírito é Pessoa, Não Força",
        bullets: [
          "Só se entristece quem tem sentimentos e relacionamento",
          "O texto ensina que o Espírito Santo é uma pessoa divina, não uma energia impessoal",
          "Reconhecer isso muda como nos relacionamos com Ele diariamente",
        ],
      },
      {
        title: "O que Entristece o Espírito",
        bullets: [
          "O contexto de Efésios 4 lista amargura, ira, gritaria, maledicência e malícia",
          "Palavras e atitudes destrutivas afetam nosso relacionamento com Deus",
          "Pecados 'pequenos' do cotidiano também têm peso espiritual",
        ],
      },
      {
        title: "O Selo da Redenção",
        bullets: [
          "Somos selados no Espírito para o dia da redenção",
          "O selo garante nossa segurança eterna em Cristo",
          "Ainda assim, somos chamados a cuidar do relacionamento que já é nosso",
        ],
      },
    ],
    applications: [
      "Identifique uma atitude (palavra dura, amargura, maledicência) que você precisa abandonar esta semana.",
      "Peça perdão a Deus por uma forma específica em que você tem entristecido o Espírito, e busque reconciliação com quem for necessário.",
    ],
    conclusion_appeal:
      "O Espírito Santo habita em você e se importa com suas atitudes. Que mudança você pode fazer hoje para honrar essa relação?",
  },
  {
    slug: "nascer-de-novo",
    title: "Nascer de Novo",
    base_text: "João 3:1-8",
    category_id: "salvacao",
    testament: "NT",
    short_description:
      "Nicodemos, um mestre religioso, precisou aprender que a religiosidade não substitui o novo nascimento espiritual.",
    central_idea:
      "Ninguém entra no Reino de Deus por esforço religioso — é necessário nascer de novo, pelo Espírito.",
    short_introduction:
      "Nicodemos era fariseu, mestre de Israel, conhecedor da lei — mas Jesus lhe disse algo que desafiou toda sua estrutura religiosa: era necessário nascer de novo. Religião não salva; um novo nascimento espiritual, sim.",
    points: [
      {
        title: "A Insuficiência da Religiosidade",
        bullets: [
          "Nicodemos tinha conhecimento bíblico, mas não tinha vida nova",
          "Conhecer sobre Deus não é o mesmo que ter um relacionamento com Ele",
          "É possível ser muito religioso e ainda não ter nascido de novo",
        ],
      },
      {
        title: "O Novo Nascimento pelo Espírito",
        bullets: [
          "Jesus explica que é necessário nascer 'da água e do Espírito'",
          "Esse nascimento é uma obra sobrenatural, não um esforço humano",
          "Assim como o vento, o Espírito age de forma que não controlamos totalmente",
        ],
      },
      {
        title: "Um Convite Pessoal e Urgente",
        bullets: [
          "Jesus não permite que Nicodemos permaneça apenas curioso",
          "O novo nascimento exige uma resposta pessoal de fé",
          "Ninguém nasce de novo por procuração — é uma decisão individual",
        ],
      },
    ],
    applications: [
      "Se você nunca teve certeza de já ter 'nascido de novo', converse com um líder de sua igreja sobre isso hoje.",
      "Ore agradecendo pelo seu próprio novo nascimento, se já o teve, e peça a Deus oportunidades de compartilhar isso com alguém esta semana.",
    ],
    conclusion_appeal:
      "Religião não basta. Você já nasceu de novo pelo Espírito de Deus? Hoje pode ser esse dia.",
  },
  {
    slug: "o-bom-pastor-busca-a-ovelha-perdida",
    title: "O Bom Pastor Busca a Ovelha Perdida",
    base_text: "Lucas 15:3-7",
    category_id: "salvacao",
    testament: "NT",
    short_description:
      "A parábola da ovelha perdida revela o coração de Deus que busca ativamente quem está distante.",
    central_idea:
      "Deus não espera passivamente pelo pecador — Ele sai ativamente em busca de quem está perdido.",
    short_introduction:
      "Diante da crítica dos fariseus por receber pecadores, Jesus conta a parábola da ovelha perdida: um pastor que deixa as noventa e nove para buscar apenas uma. Essa é a imagem do coração de Deus por cada pessoa perdida.",
    points: [
      {
        title: "O Valor de Uma Só Ovelha",
        bullets: [
          "O pastor não se conforma em perder apenas uma ovelha",
          "Aos olhos de Deus, cada pessoa individual tem valor imenso",
          "Ninguém é 'só mais um' diante de Deus",
        ],
      },
      {
        title: "Uma Busca Ativa",
        bullets: [
          "O pastor vai atrás da ovelha 'até que a ache'",
          "Deus toma a iniciativa de buscar o pecador, não o contrário",
          "A salvação começa com o amor que sai à nossa procura",
        ],
      },
      {
        title: "A Alegria do Reencontro",
        bullets: [
          "O pastor põe a ovelha nos ombros, alegre",
          "Há alegria no céu por um pecador que se arrepende",
          "A festa pelo reencontro revela o valor que Deus dá a cada retorno",
        ],
      },
    ],
    applications: [
      "Se você se sente 'perdido' ou distante de Deus, saiba que Ele está ativamente buscando você — responda a esse chamado hoje.",
      "Pense em alguém que está 'longe do rebanho' e ore para que Deus use você como parte da busca por essa pessoa.",
    ],
    conclusion_appeal:
      "Você não está longe demais para ser encontrado. O Pastor está buscando você — hoje é dia de voltar.",
  },
  {
    slug: "da-escuridao-a-luz-maravilhosa",
    title: "Da Escuridão à Luz Maravilhosa",
    base_text: "1 Pedro 2:9-10",
    category_id: "salvacao",
    testament: "NT",
    short_description:
      "A identidade do crente como povo escolhido, chamado das trevas para a luz maravilhosa de Deus.",
    central_idea:
      "Antes éramos 'não povo'; agora somos povo de Deus, chamados das trevas para Sua luz maravilhosa.",
    short_introduction:
      "Pedro descreve a mudança radical de identidade que a salvação produz: de estranhos e sem misericórdia, a geração eleita, sacerdócio real, povo de Deus. Essa transformação não é apenas de status, mas de propósito.",
    points: [
      {
        title: "Uma Nova Identidade",
        bullets: [
          "Somos chamados 'geração eleita, sacerdócio real, nação santa'",
          "Nossa identidade em Cristo substitui qualquer identidade anterior",
          "Saber quem somos em Cristo muda como vivemos",
        ],
      },
      {
        title: "De Trevas para Luz",
        bullets: [
          "A salvação é descrita como um chamado 'das trevas para a Sua maravilhosa luz'",
          "A mudança não é apenas moral, é de reino e de pertencimento",
          "Viver na luz significa refletir o caráter de quem nos chamou",
        ],
      },
      {
        title: "Um Propósito de Anunciar",
        bullets: [
          "Fomos chamados para anunciar as virtudes daquele que nos chamou",
          "A identidade recebida vem com uma missão de testemunho",
          "Quem foi alcançado pela graça é chamado a compartilhá-la",
        ],
      },
    ],
    applications: [
      "Escreva num papel quem você era antes de Cristo e quem você é agora, segundo 1 Pedro 2:9-10.",
      "Compartilhe com alguém hoje, em poucas palavras, a diferença que Cristo fez na sua vida.",
    ],
    conclusion_appeal:
      "Você já foi chamado das trevas para a luz maravilhosa. Viva e anuncie essa nova identidade hoje.",
  },
  {
    slug: "o-ladrao-na-cruz-nunca-e-tarde-demais",
    title: "O Ladrão na Cruz: Nunca é Tarde Demais",
    base_text: "Lucas 23:39-43",
    category_id: "salvacao",
    testament: "NT",
    short_description:
      "Ao lado de Jesus na cruz, um criminoso encontrou salvação no último momento de sua vida.",
    central_idea:
      "A salvação não depende de uma vida perfeita ou de tempo — depende apenas de um coração que se volta para Jesus.",
    short_introduction:
      "Pendurado numa cruz ao lado de Jesus, sem tempo para 'consertar' sua vida, um criminoso fez a única coisa que importava: reconheceu quem Jesus era e pediu para ser lembrado. E recebeu a resposta mais imediata de salvação registrada nos Evangelhos.",
    points: [
      {
        title: "O Reconhecimento da Própria Condição",
        bullets: [
          "O criminoso admite: 'nós, na verdade, com justiça'",
          "Reconhecer o próprio pecado é o primeiro passo para a graça",
          "Não há salvação sem admitir que precisamos ser salvos",
        ],
      },
      {
        title: "O Reconhecimento de Quem é Jesus",
        bullets: [
          "Ele repreende o outro criminoso e declara a inocência de Jesus",
          "Reconhecer a identidade de Jesus é central para a fé salvadora",
          "Sua confissão foi simples, mas verdadeira",
        ],
      },
      {
        title: "A Resposta Imediata de Jesus",
        bullets: [
          "'Hoje estarás comigo no paraíso'",
          "A salvação de Jesus não exigiu obras nem tempo de preparação",
          "A graça de Deus alcança até o último momento de uma vida",
        ],
      },
    ],
    applications: [
      "Se você tem adiado uma decisão de fé por achar que 'ainda não está pronto', saiba que não existe pré-requisito além de um coração sincero.",
      "Ore por alguém que você conhece que parece estar 'longe demais' ou 'tarde demais' para se aproximar de Deus.",
    ],
    conclusion_appeal:
      "Não existe pessoa longe demais, nem momento tarde demais, para a graça de Jesus. Hoje pode ser o seu dia.",
  },
  {
    slug: "salvos-pela-graca-nao-pelas-obras",
    title: "Salvos pela Graça, Não pelas Obras",
    base_text: "Tito 3:4-7",
    category_id: "salvacao",
    testament: "NT",
    short_description:
      "Paulo lembra Tito que a salvação vem da bondade e misericórdia de Deus, não das obras de justiça que fizemos.",
    central_idea:
      "Fomos salvos não por obras de justiça que praticamos, mas segundo a misericórdia de Deus.",
    short_introduction:
      "É fácil pensar que Deus nos aceita quando fazemos o suficiente de bom. Paulo derruba essa ideia: a salvação vem da bondade e do amor de Deus para com o homem, manifestos independentemente do nosso mérito.",
    points: [
      {
        title: "A Iniciativa de Deus",
        bullets: [
          "'Quando, porém, a benignidade e o amor de Deus, nosso Salvador, apareceu'",
          "A salvação começou com a ação de Deus, não com nosso esforço",
          "Deus tomou a iniciativa antes de merecermos qualquer coisa",
        ],
      },
      {
        title: "Não por Obras de Justiça",
        bullets: [
          "O texto é explícito: 'não pelas obras de justiça que houvéssemos feito'",
          "Nenhuma quantidade de boas ações compra a salvação",
          "A tentativa de merecer a salvação é, na verdade, uma negação da graça",
        ],
      },
      {
        title: "Pela Misericórdia, pelo Lavar da Regeneração",
        bullets: [
          "A salvação é 'segundo a sua misericórdia'",
          "O Espírito Santo é quem opera a regeneração e a renovação",
          "Somos feitos herdeiros da vida eterna pela graça, não pelo mérito",
        ],
      },
    ],
    applications: [
      "Se você tem tentado 'compensar' Deus com boas obras por culpa, entregue essa carga a Ele em oração hoje.",
      "Agradeça especificamente por três coisas que Deus fez por você que você não merecia.",
    ],
    conclusion_appeal:
      "Você não precisa se esforçar para merecer o que já é dado por graça. Receba hoje a salvação como o presente que ela é.",
  },
  {
    slug: "ainda-que-a-figueira-nao-floresca",
    title: "Ainda Que a Figueira Não Floresça",
    base_text: "Habacuque 3:17-19",
    category_id: "esperanca",
    testament: "AT",
    short_description:
      "Habacuque declara confiança em Deus mesmo diante da perda total — um modelo de esperança que não depende de circunstâncias.",
    central_idea: "É possível regozijar-se no Senhor mesmo quando tudo ao redor parece falhar.",
    short_introduction:
      "Habacuque escreve numa época de crise iminente, prevendo perda de colheita, de rebanho, de sustento. Ainda assim, ele declara uma das confissões de fé mais radicais da Bíblia: 'todavia, eu me alegrarei no Senhor'.",
    points: [
      {
        title: "Reconhecendo a Realidade da Perda",
        bullets: [
          "O profeta não nega a possibilidade de perder tudo",
          "Fé bíblica não ignora a dificuldade real da vida",
          "É possível ser honesto sobre a crise e ainda confiar em Deus",
        ],
      },
      {
        title: "Uma Alegria que Não Depende de Circunstâncias",
        bullets: [
          "'Todavia, eu me alegrarei no Senhor' — apesar de tudo",
          "A alegria de Habacuque está em Deus, não nas colheitas",
          "Nossa fonte de alegria revela onde está nossa verdadeira confiança",
        ],
      },
      {
        title: "Forças Renovadas para Caminhar",
        bullets: [
          "'O Senhor Jeová é a minha força'",
          "Deus torna os pés do fiel como os das corças, firmes nos altos",
          "A força de Deus nos capacita a caminhar mesmo em terreno difícil",
        ],
      },
    ],
    applications: [
      "Identifique uma 'figueira que não floresceu' na sua vida hoje e declare, como Habacuque, que ainda assim vai se alegrar no Senhor.",
      "Escreva um versículo desse texto e coloque em um lugar visível para lembrar dessa confiança durante a semana.",
    ],
    conclusion_appeal:
      "Sua alegria pode estar segura em Deus, mesmo quando as circunstâncias falham. Você se alegra apesar de quê, hoje?",
  },
  {
    slug: "deus-faz-novas-todas-as-coisas",
    title: "Deus Faz Novas Todas as Coisas",
    base_text: "Apocalipse 21:1-5",
    category_id: "esperanca",
    testament: "NT",
    short_description:
      "A visão de João do novo céu e nova terra é o horizonte final de esperança para todo cristão.",
    central_idea:
      "A esperança cristã não termina na morte nem na dor presente — ela aponta para a restauração completa de todas as coisas.",
    short_introduction:
      "No meio de tribulação e perseguição, João recebe uma visão que muda toda perspectiva: um novo céu, uma nova terra, e Deus enxugando toda lágrima. Essa promessa final é a âncora de toda esperança cristã.",
    points: [
      {
        title: "Um Novo Começo Prometido",
        bullets: [
          "João vê 'um novo céu e uma nova terra'",
          "As coisas antigas passarão — a dor presente não é definitiva",
          "A esperança cristã olha além do que os olhos veem hoje",
        ],
      },
      {
        title: "A Presença de Deus entre Nós",
        bullets: [
          "'Eis que o tabernáculo de Deus está com os homens'",
          "A promessa final não é apenas um lugar, é a presença de Deus",
          "A comunhão plena com Deus é o centro da esperança eterna",
        ],
      },
      {
        title: "O Fim de Toda Dor",
        bullets: [
          "Deus enxugará toda lágrima dos olhos",
          "Não haverá mais morte, nem pranto, nem clamor, nem dor",
          "'Eis que faço novas todas as coisas' — a promessa é certa e completa",
        ],
      },
    ],
    applications: [
      "Quando enfrentar uma dor essa semana, lembre-se conscientemente de que ela não é a palavra final da sua história.",
      "Compartilhe essa esperança com alguém que está passando por perda ou luto.",
    ],
    conclusion_appeal:
      "A dor de hoje não é o fim da história. Deus promete fazer novas todas as coisas — viva agarrado a essa esperança.",
  },
  {
    slug: "a-ancora-da-alma",
    title: "A Âncora da Alma",
    base_text: "Hebreus 6:18-19",
    category_id: "esperanca",
    testament: "NT",
    short_description:
      "A esperança em Cristo é descrita como âncora firme e segura da alma, que penetra além do véu.",
    central_idea:
      "A esperança cristã é uma âncora firme para a alma, baseada não em sentimentos, mas nas promessas imutáveis de Deus.",
    short_introduction:
      "Numa tempestade, o navio precisa de uma âncora que segure firme no fundo do mar. Hebreus descreve a esperança que temos em Cristo dessa forma: firme, segura, capaz de sustentar a alma em meio a qualquer tempestade da vida.",
    points: [
      {
        title: "Baseada em Promessas Imutáveis",
        bullets: [
          "Deus confirmou Sua promessa com juramento para que tivéssemos consolação",
          "É impossível que Deus minta",
          "Nossa esperança não depende de sentimentos variáveis, mas do caráter fiel de Deus",
        ],
      },
      {
        title: "Firme e Segura",
        bullets: [
          "A âncora não se move mesmo quando o mar está agitado",
          "A esperança bíblica sustenta a alma em meio à instabilidade da vida",
          "Não é uma esperança vaga, é uma certeza fundamentada em Cristo",
        ],
      },
      {
        title: "Que Penetra Além do Véu",
        bullets: [
          "A esperança nos conecta ao lugar santíssimo, à presença de Deus",
          "Jesus, como precursor, já entrou por nós nesse lugar",
          "Nossa esperança tem acesso direto à presença de Deus, por meio de Cristo",
        ],
      },
    ],
    applications: [
      "Nas tempestades que você enfrenta agora, identifique em que sua esperança está realmente ancorada.",
      "Memorize Hebreus 6:19 esta semana como lembrete da firmeza da sua esperança em Cristo.",
    ],
    conclusion_appeal:
      "Em meio à tempestade, sua alma pode estar firme. Ancore sua esperança nas promessas imutáveis de Deus.",
  },
  {
    slug: "noemi-quando-a-amargura-da-lugar-a-esperanca",
    title: "Noemi: Quando a Amargura Dá Lugar à Esperança",
    base_text: "Rute 1:20-21; 4:14-17",
    category_id: "esperanca",
    testament: "AT",
    short_description:
      "Noemi, que pediu para ser chamada de 'Amargura', terminou sua história segurando o neto que restaurou sua esperança.",
    central_idea:
      "Mesmo quando a dor nos faz pedir novo nome — Amargura —, Deus está trabalhando para restaurar nossa esperança.",
    short_introduction:
      "Noemi voltou a Belém vazia, tendo perdido marido e filhos, e pediu para ser chamada de Mara, 'amargura'. Mas a mesma história que começou em perda termina com ela segurando nos braços o neto que se tornaria parte da linhagem de Davi — e de Jesus.",
    points: [
      {
        title: "O Peso Real da Perda",
        bullets: [
          "Noemi expressa sua dor sem disfarces: 'o Todo-Poderoso me amargurou muito'",
          "A Bíblia não minimiza a dor real da perda e do luto",
          "É legítimo nomear a amargura quando ela existe",
        ],
      },
      {
        title: "A Fidelidade Silenciosa em Meio à Dor",
        bullets: [
          "Mesmo amargurada, Noemi não abandona sua fé nem sua família",
          "Rute permanece leal a Noemi mesmo em meio à tristeza compartilhada",
          "A fidelidade de Deus continua operando mesmo quando não percebemos",
        ],
      },
      {
        title: "A Restauração Inesperada",
        bullets: [
          "As mulheres de Belém declaram que o neto de Noemi seria 'restaurador de sua vida'",
          "Obede, o neto de Noemi, seria avô de Davi — parte da linhagem do Messias",
          "A dor de Noemi se transformou em parte da história da salvação",
        ],
      },
    ],
    applications: [
      "Se você carrega uma amargura antiga, nomeie-a diante de Deus como Noemi fez, sem esconder a dor.",
      "Confie que Deus pode estar tecendo restauração mesmo em capítulos da sua vida que ainda parecem só perda.",
    ],
    conclusion_appeal:
      "A história de Noemi não terminou na amargura. A sua também não precisa terminar aí — confie no Deus que restaura.",
  },
  {
    slug: "sede-santos-porque-eu-sou-santo",
    title: "Sede Santos, Porque Eu Sou Santo",
    base_text: "1 Pedro 1:14-16",
    category_id: "santidade",
    testament: "NT",
    short_description:
      "Pedro convoca os crentes a viver de forma diferente do padrão anterior, refletindo o próprio caráter de Deus.",
    central_idea:
      "A santidade não é uma lista de regras, é o reflexo do caráter de Deus na vida de quem foi chamado por Ele.",
    short_introduction:
      "Pedro escreve a crentes espalhados, lembrando-os de que eles não devem se conformar aos desejos que tinham antes de conhecer a Cristo. Em vez disso, são chamados a refletir a santidade daquele que os chamou.",
    points: [
      {
        title: "Não se Conformando aos Desejos Antigos",
        bullets: [
          "'Não vos conformando com as concupiscências que antes tínheis'",
          "A vida cristã envolve uma ruptura consciente com padrões antigos",
          "Não se trata de perfeição instantânea, mas de direção nova",
        ],
      },
      {
        title: "Como Filhos Obedientes",
        bullets: [
          "A santidade nasce da identidade de filhos, não do medo de punição",
          "Obediência é resposta de amor, não tentativa de agradar por mérito",
          "Filhos imitam o caráter do Pai que os gerou",
        ],
      },
      {
        title: "Refletindo o Caráter de Deus",
        bullets: [
          "'Sede santos, porque eu sou santo'",
          "A santidade de Deus é o padrão, não a cultura ao redor",
          "Ser santo é ser separado para refletir quem Deus é em cada área da vida",
        ],
      },
    ],
    applications: [
      "Identifique um 'desejo antigo' que ainda tenta moldar suas escolhas e entregue-o a Deus hoje.",
      "Escolha uma área específica da sua vida (fala, pensamentos, hábitos) para buscar mais alinhamento com o caráter de Deus esta semana.",
    ],
    conclusion_appeal:
      "Você foi chamado para refletir o caráter de um Deus santo. Que área da sua vida precisa desse chamado hoje?",
  },
  {
    slug: "vasos-de-honra-na-casa-do-senhor",
    title: "Vasos de Honra na Casa do Senhor",
    base_text: "2 Timóteo 2:20-22",
    category_id: "santidade",
    testament: "NT",
    short_description:
      "Paulo usa a imagem de vasos de honra e de desonra para ensinar sobre pureza e utilidade no serviço a Deus.",
    central_idea:
      "Quem se purifica das coisas indignas se torna vaso de honra, útil e preparado para toda boa obra.",
    short_introduction:
      "Numa casa grande há vasos de ouro e de prata, mas também de madeira e de barro — uns para honra, outros para desonra. Paulo ensina que a purificação pessoal determina para qual uso Deus nos separa.",
    points: [
      {
        title: "A Realidade da Diversidade de Vasos",
        bullets: [
          "Nem todo vaso na casa serve para o mesmo propósito",
          "A comparação entre vasos de honra e desonra ilustra escolhas de vida",
          "Cada pessoa decide, em parte, que tipo de vaso será",
        ],
      },
      {
        title: "A Purificação como Caminho",
        bullets: [
          "'Se alguém, pois, se purificar destas coisas, será vaso para honra'",
          "Purificação envolve afastar-se de práticas e influências que contaminam",
          "Não é perfeição, é uma direção intencional de separação para Deus",
        ],
      },
      {
        title: "Preparado para Toda Boa Obra",
        bullets: [
          "O vaso purificado é 'santificado e útil para o Senhor'",
          "Deus prepara para o serviço aqueles que se dispõem a ser purificados",
          "Fugir das paixões da mocidade e seguir a justiça, fé, amor e paz molda esse caminho",
        ],
      },
    ],
    applications: [
      "Identifique algo em sua vida que precisa ser afastado para que você seja um vaso mais útil ao Senhor.",
      "Ore pedindo que Deus te prepare, através da purificação, para uma boa obra específica que Ele tem para você.",
    ],
    conclusion_appeal:
      "Que tipo de vaso você está sendo formado para ser? A purificação de hoje prepara a utilidade de amanhã.",
  },
  {
    slug: "a-luta-contra-o-pecado-que-habita-em-nos",
    title: "A Luta contra o Pecado que Habita em Nós",
    base_text: "Romanos 7:15-25",
    category_id: "santidade",
    testament: "NT",
    short_description:
      "Paulo descreve honestamente a luta interior entre o desejo de fazer o bem e a força do pecado que ainda habita em nós.",
    central_idea:
      "A luta contra o pecado é real mesmo depois da conversão, mas a vitória final está garantida em Cristo Jesus.",
    short_introduction:
      "Paulo, um dos maiores apóstolos, confessa uma luta interior intensa: 'o bem que quero, não o faço; mas o mal que não quero, esse faço'. Essa honestidade nos liberta de fingir uma santidade sem luta.",
    points: [
      {
        title: "A Realidade da Luta Interior",
        bullets: [
          "Mesmo Paulo reconhece uma guerra entre a vontade e a prática",
          "A conversão não elimina imediatamente toda inclinação ao pecado",
          "Reconhecer a luta é mais saudável do que negar sua existência",
        ],
      },
      {
        title: "A Frustração de Quem Quer o Bem",
        bullets: [
          "'Miserável homem que eu sou! Quem me livrará do corpo desta morte?'",
          "É possível desejar sinceramente o bem e ainda falhar",
          "Essa frustração é comum a todo cristão sincero, não sinal de fé fraca",
        ],
      },
      {
        title: "A Resposta que Está em Cristo",
        bullets: [
          "'Graças a Deus, por Jesus Cristo nosso Senhor'",
          "A vitória sobre o pecado não vem do esforço próprio, mas de Cristo",
          "A luta continua, mas a esperança está firme na obra de Jesus",
        ],
      },
    ],
    applications: [
      "Seja honesto hoje diante de Deus sobre uma luta específica que você enfrenta, sem fingir vitória que ainda não tem.",
      "Agradeça a Deus por Jesus Cristo ser a resposta para essa luta, e peça força renovada para caminhar em direção ao bem.",
    ],
    conclusion_appeal:
      "Você não está sozinho nessa luta, e ela não define sua identidade final. A vitória está garantida em Cristo — continue lutando o bom combate.",
  },
  {
    slug: "jose-do-egito-fugindo-da-tentacao",
    title: "José do Egito: Fugindo da Tentação",
    base_text: "Gênesis 39:7-12",
    category_id: "santidade",
    testament: "AT",
    short_description:
      "José escolheu fugir da tentação em vez de flertar com ela — um exemplo prático de integridade sob pressão.",
    central_idea:
      "Diante da tentação, a atitude mais sábia muitas vezes não é resistir parado, é fugir imediatamente.",
    short_introduction:
      "Longe de casa, escravo no Egito, José enfrenta uma tentação persistente da mulher de Potifar. Sua resposta não foi negociar com o pecado — foi fugir, literalmente, deixando a capa na mão dela.",
    points: [
      {
        title: "A Tentação Persistente",
        bullets: [
          "A mulher de Potifar insistia dia após dia",
          "Tentações recorrentes exigem vigilância contínua, não apenas uma vitória pontual",
          "A pressão para pecar muitas vezes não desiste na primeira recusa",
        ],
      },
      {
        title: "A Base da Recusa de José",
        bullets: [
          "José recusa dizendo: 'como pois faria eu este grande mal, e pecaria contra Deus?'",
          "Sua integridade estava enraizada no relacionamento com Deus, não apenas no medo de consequências",
          "Lembrar quem somos diante de Deus fortalece a recusa ao pecado",
        ],
      },
      {
        title: "A Decisão de Fugir",
        bullets: [
          "Quando a situação se tornou fisicamente perigosa, José fugiu, deixando até a capa",
          "Fugir da tentação não é fraqueza, é sabedoria",
          "Algumas situações exigem retirada imediata, não debate interno",
        ],
      },
    ],
    applications: [
      "Identifique uma situação em que fugir seria mais sábio do que tentar 'resistir' por conta própria.",
      "Lembre-se hoje de que sua integridade diante de Deus é a base mais forte para recusar qualquer tentação.",
    ],
    conclusion_appeal:
      "Às vezes a melhor resposta à tentação não é debater, é fugir. Que 'capa' você precisa estar disposto a deixar para trás hoje?",
  },
  {
    slug: "correndo-a-corrida-com-perseveranca",
    title: "Correndo a Corrida com Perseverança",
    base_text: "Hebreus 12:1-3",
    category_id: "vida-crista",
    testament: "NT",
    short_description:
      "Cercados por uma grande nuvem de testemunhas, somos chamados a correr com perseverança, olhando para Jesus.",
    central_idea:
      "A vida cristã é uma corrida de resistência que exige despojar-se de pesos e manter os olhos fixos em Jesus.",
    short_introduction:
      "Depois de listar heróis da fé no capítulo 11, Hebreus 12 convida cada crente a correr sua própria corrida — não com a força própria, mas olhando para Jesus, autor e consumador da fé.",
    points: [
      {
        title: "Despojando-se de Todo Peso",
        bullets: [
          "'Deixemos todo o peso e o pecado que tão de perto nos rodeia'",
          "Nem tudo que carregamos é pecado, mas pode ser peso que atrapalha a corrida",
          "Avaliar o que carregamos é parte da disciplina cristã",
        ],
      },
      {
        title: "Correndo com Perseverança",
        bullets: [
          "A corrida cristã não é uma disparada, é resistência ao longo do tempo",
          "Perseverança envolve continuar mesmo quando o cansaço aparece",
          "A grande nuvem de testemunhas encoraja, não compete conosco",
        ],
      },
      {
        title: "Olhando para Jesus",
        bullets: [
          "Jesus é 'o autor e consumador da fé'",
          "Ele suportou a cruz, desprezando a afronta, por causa da alegria posta diante dele",
          "Manter os olhos em Jesus evita que nos cansemos e desanimemos",
        ],
      },
    ],
    applications: [
      "Identifique um 'peso' (não necessariamente pecado) que está atrapalhando sua corrida espiritual e faça um plano para lidar com ele.",
      "Escolha uma prática diária (leitura bíblica, oração) que ajude você a manter os olhos fixos em Jesus nesta semana.",
    ],
    conclusion_appeal: "Sua corrida não é sobre velocidade, é sobre perseverança com os olhos em Jesus. Continue correndo.",
  },
  {
    slug: "sal-da-terra-e-luz-do-mundo",
    title: "Sal da Terra e Luz do Mundo",
    base_text: "Mateus 5:13-16",
    category_id: "vida-crista",
    testament: "NT",
    short_description:
      "Jesus descreve a identidade e o impacto prático do cristão no mundo: sal que preserva e luz que ilumina.",
    central_idea:
      "O cristão é chamado a influenciar o mundo ao redor, preservando o que é bom e iluminando o que está escuro.",
    short_introduction:
      "Depois das Bem-Aventuranças, Jesus descreve a função dos Seus seguidores no mundo com duas imagens simples e poderosas: sal e luz. Ambas falam de presença ativa, não de isolamento passivo.",
    points: [
      {
        title: "Sal que Preserva",
        bullets: [
          "O sal impede a corrupção e dá sabor",
          "Um cristão fiel exerce influência moral positiva ao redor",
          "Sal que perde o sabor não serve para nada — de nada adianta uma fé sem impacto real",
        ],
      },
      {
        title: "Luz que Ilumina",
        bullets: [
          "'Não se pode esconder uma cidade edificada sobre um monte'",
          "A luz não é feita para ser escondida, mas para iluminar toda a casa",
          "Nossa vida deve ser visível o suficiente para orientar outros",
        ],
      },
      {
        title: "Boas Obras que Glorificam a Deus",
        bullets: [
          "'Assim resplandeça a vossa luz diante dos homens'",
          "O objetivo final das boas obras visíveis é que Deus seja glorificado",
          "Não vivemos para nossa própria exibição, mas para apontar ao Pai",
        ],
      },
    ],
    applications: [
      "Identifique uma área da sua vida onde você tem 'escondido a luz' por medo ou comodismo, e mude isso esta semana.",
      "Pratique hoje um ato visível de bondade que aponte para Deus, não para você mesmo.",
    ],
    conclusion_appeal:
      "Você é sal e luz onde está. Não esconda o que Deus colocou em você para influenciar o mundo ao redor.",
  },
  {
    slug: "vivendo-em-novidade-de-vida",
    title: "Vivendo em Novidade de Vida",
    base_text: "Romanos 6:4-6",
    category_id: "vida-crista",
    testament: "NT",
    short_description:
      "O batismo simboliza nossa identificação com a morte e ressurreição de Cristo, chamando-nos a andar em novidade de vida.",
    central_idea:
      "Fomos sepultados com Cristo no batismo para que, assim como Ele ressuscitou, andássemos em novidade de vida.",
    short_introduction:
      "Paulo explica que o batismo não é apenas um ritual simbólico — representa nossa morte para o pecado e nossa ressurreição para uma nova forma de viver, identificados com Cristo.",
    points: [
      {
        title: "Identificados com a Morte de Cristo",
        bullets: [
          "O batismo simboliza sermos sepultados com Cristo",
          "O 'velho homem' foi crucificado com Ele",
          "Há uma morte real ao domínio do pecado na vida de quem está em Cristo",
        ],
      },
      {
        title: "Ressuscitados para Nova Vida",
        bullets: [
          "'Assim como Cristo foi ressuscitado dos mortos... também nós andemos em novidade de vida'",
          "A nova vida não é aperfeiçoamento da antiga, é uma vida genuinamente nova",
          "Viver em novidade envolve escolhas diárias alinhadas com essa nova identidade",
        ],
      },
      {
        title: "Libertos da Escravidão do Pecado",
        bullets: [
          "'Para que não sirvamos mais ao pecado'",
          "A identificação com Cristo quebra o domínio que o pecado tinha sobre nós",
          "Somos libertos não apenas da culpa, mas do controle do pecado",
        ],
      },
    ],
    applications: [
      "Reflita sobre o que significou seu próprio batismo (ou considere esse passo, se ainda não o deu) à luz desse texto.",
      "Identifique uma área em que você ainda vive como o 'velho homem' e escolha andar hoje em novidade de vida nela.",
    ],
    conclusion_appeal:
      "Você foi sepultado com Cristo para ressuscitar para uma nova vida. Que área precisa refletir essa novidade hoje?",
  },
  {
    slug: "marta-e-maria-escolhendo-a-melhor-parte",
    title: "Marta e Maria: Escolhendo a Melhor Parte",
    base_text: "Lucas 10:38-42",
    category_id: "vida-crista",
    testament: "NT",
    short_description:
      "Enquanto Marta se preocupava com o serviço, Maria escolheu sentar aos pés de Jesus — e Ele elogiou essa escolha.",
    central_idea:
      "No meio das ocupações legítimas da vida, é preciso escolher intencionalmente o tempo de estar com Jesus.",
    short_introduction:
      "Marta recebeu Jesus em sua casa e se ocupou em servir; Maria sentou-se aos Seus pés para ouvi-Lo. Quando Marta reclama, Jesus responde com uma lição sobre prioridades: 'Maria escolheu a boa parte'.",
    points: [
      {
        title: "O Cuidado Legítimo de Marta",
        bullets: [
          "Servir a Jesus com hospitalidade não era errado",
          "Marta estava 'atarefada em muito serviço' — um cuidado genuíno",
          "O problema não era o serviço, era a ansiedade e a distração que ele gerou",
        ],
      },
      {
        title: "A Escolha de Maria",
        bullets: [
          "Maria optou por sentar-se aos pés de Jesus e ouvir Sua palavra",
          "Essa era, na época, uma postura reservada a discípulos formais",
          "Maria priorizou comunhão com Jesus acima das tarefas ao redor",
        ],
      },
      {
        title: "A Resposta de Jesus",
        bullets: [
          "'Maria escolheu a boa parte, a qual não lhe será tirada'",
          "Jesus não condena o serviço, mas destaca a prioridade da comunhão",
          "Existe 'uma coisa' que é necessária acima de todas as outras: estar com Ele",
        ],
      },
    ],
    applications: [
      "Avalie se sua rotina tem mais 'Marta' (ocupação ansiosa) do que 'Maria' (tempo de comunhão) e ajuste algo esta semana.",
      "Separe hoje um tempo específico, sem distrações, apenas para estar na presença de Deus através da Palavra e da oração.",
    ],
    conclusion_appeal:
      "No meio das suas tarefas legítimas, você tem escolhido a boa parte? Sente-se aos pés de Jesus hoje.",
  },
  {
    slug: "ninguem-despreze-a-tua-mocidade",
    title: "Ninguém Despreze a Tua Mocidade",
    base_text: "1 Timóteo 4:12",
    category_id: "jovens",
    testament: "NT",
    short_description:
      "Paulo encoraja o jovem Timóteo a ser exemplo em palavra, conduta, amor, espírito, fé e pureza, apesar da idade.",
    central_idea:
      "A idade não é impedimento para ser exemplo de fé — o caráter fala mais alto do que os anos vividos.",
    short_introduction:
      "Timóteo era jovem, liderando uma igreja com membros mais velhos e experientes. Paulo o instrui: em vez de se intimidar pela idade, que ele se torne exemplo — não apesar de ser jovem, mas através de um caráter que ninguém pudesse desprezar.",
    points: [
      {
        title: "Ser Exemplo, Não se Esconder",
        bullets: [
          "'Ninguém despreze a tua mocidade' é um chamado à ação, não a passividade",
          "Timóteo deveria se tornar exemplo, não esperar que a idade lhe desse autoridade",
          "Jovens podem influenciar mesmo antes de ter décadas de experiência",
        ],
      },
      {
        title: "Exemplo em Áreas Concretas",
        bullets: [
          "Palavra, conduta, amor, espírito, fé e pureza são listados especificamente",
          "Ser exemplo envolve o que se fala, como se vive e o que se ama",
          "O caráter íntegro fala mais alto do que discursos",
        ],
      },
      {
        title: "Dedicação Contínua às Coisas de Deus",
        bullets: [
          "Paulo pede que Timóteo se dedique à leitura, exortação e doutrina",
          "O crescimento espiritual do jovem líder deveria ser evidente a todos",
          "O progresso visível constrói respeito ao longo do tempo",
        ],
      },
    ],
    applications: [
      "Escolha uma das seis áreas citadas (palavra, conduta, amor, espírito, fé, pureza) para trabalhar intencionalmente essa semana.",
      "Não espere ter mais idade para começar a influenciar positivamente as pessoas ao seu redor — comece hoje.",
    ],
    conclusion_appeal:
      "Sua idade não determina seu impacto — seu caráter, sim. Que exemplo você está sendo, hoje, para quem observa sua vida?",
  },
  {
    slug: "daniel-firme-em-terra-estrangeira",
    title: "Daniel: Firme em Terra Estrangeira",
    base_text: "Daniel 1:8-16",
    category_id: "jovens",
    testament: "AT",
    short_description:
      "Levado cativo para a Babilônia, Daniel decidiu não se contaminar — um exemplo de convicção jovem em ambiente hostil.",
    central_idea:
      "É possível manter convicções firmes mesmo cercado por uma cultura completamente diferente da sua fé.",
    short_introduction:
      "Ainda jovem, Daniel foi levado para a Babilônia, um ambiente hostil aos valores que aprendera. Em vez de se acomodar à cultura ao redor, ele 'propôs no coração' não se contaminar — e Deus honrou essa decisão.",
    points: [
      {
        title: "Uma Decisão Consciente",
        bullets: [
          "'Daniel propôs no seu coração não se contaminar'",
          "A convicção começou como uma decisão interna, antes de virar ação externa",
          "Decisões de caráter precisam ser feitas antes que a pressão apareça",
        ],
      },
      {
        title: "Firmeza com Sabedoria",
        bullets: [
          "Daniel não se rebelou com arrogância, pediu com respeito ao encarregado",
          "É possível manter convicção sem hostilidade",
          "A sabedoria na forma de agir abriu portas que a teimosia teria fechado",
        ],
      },
      {
        title: "O Favor de Deus na Fidelidade",
        bullets: [
          "Deus concedeu a Daniel graça diante do encarregado",
          "Ao final do teste, Daniel e os amigos estavam visivelmente mais saudáveis",
          "A fidelidade, mesmo em pequenas escolhas, atrai o favor de Deus",
        ],
      },
    ],
    applications: [
      "Identifique uma área da sua vida em que a cultura ao redor pressiona você a 'se contaminar' e proponha no coração, como Daniel, permanecer fiel.",
      "Pratique expressar suas convicções com respeito, não com hostilidade, diante de quem pensa diferente de você.",
    ],
    conclusion_appeal:
      "Você pode ser jovem e ainda assim firme nas suas convicções, como Daniel foi na Babilônia. O que você vai propor no coração hoje?",
  },
  {
    slug: "lembra-te-do-teu-criador-na-juventude",
    title: "Lembra-te do Teu Criador na Juventude",
    base_text: "Eclesiastes 12:1",
    category_id: "jovens",
    testament: "AT",
    short_description:
      "O sábio conselho de buscar a Deus enquanto ainda se é jovem, antes que os dias difíceis cheguem.",
    central_idea:
      "Buscar a Deus na juventude estabelece um fundamento que sustenta toda a vida, inclusive os dias difíceis que virão.",
    short_introduction:
      "Depois de refletir sobre o sentido da vida, o Pregador dá um conselho direto aos jovens: 'lembra-te do teu Criador nos dias da tua mocidade'. Não é um conselho para 'depois' — é para agora, antes que os desafios da vida se acumulem.",
    points: [
      {
        title: "O Tempo Certo é Agora",
        bullets: [
          "O texto especifica 'nos dias da tua mocidade', não 'quando envelhecer'",
          "Adiar a busca por Deus tem um custo — hábitos e prioridades se cristalizam com o tempo",
          "A juventude é o solo mais fértil para plantar convicções profundas",
        ],
      },
      {
        title: "Antes que Venham os Dias Maus",
        bullets: [
          "O Pregador descreve o envelhecimento com metáforas de declínio físico",
          "Buscar a Deus cedo prepara um alicerce espiritual para as dificuldades futuras",
          "Fé construída na juventude sustenta melhor as crises da vida adulta",
        ],
      },
      {
        title: "Lembrar do Criador Muda a Perspectiva",
        bullets: [
          "'Lembrar' aqui é mais que recordar, é manter presente e prioritário",
          "Reconhecer que Deus é o Criador coloca a vida em sua perspectiva correta",
          "Uma vida centrada no Criador escapa da vaidade que o restante de Eclesiastes descreve",
        ],
      },
    ],
    applications: [
      "Se você é jovem, não adie decisões espirituais importantes para 'quando for mais velho' — comece hoje.",
      "Se você influencia jovens (como pai, líder ou mentor), incentive-os a buscar a Deus agora, não depois.",
    ],
    conclusion_appeal:
      "O melhor tempo para buscar a Deus não é 'algum dia' — é agora, na juventude. O que você vai fazer com esse conselho hoje?",
  },
  {
    slug: "timoteo-um-jovem-formado-na-fe-de-casa",
    title: "Timóteo: Um Jovem Formado na Fé de Casa",
    base_text: "2 Timóteo 1:5-7",
    category_id: "jovens",
    testament: "NT",
    short_description:
      "Paulo lembra Timóteo da fé sincera que habitou primeiro em sua avó e mãe — um legado espiritual transmitido em casa.",
    central_idea:
      "A fé recebida em casa, através de avós e pais, é um alicerce poderoso para a vida espiritual de um jovem.",
    short_introduction:
      "Paulo escreve a Timóteo lembrando da 'fé não fingida' que primeiro habitou em Loide, sua avó, e Eunice, sua mãe. Esse legado familiar moldou Timóteo antes mesmo de ele se tornar líder na igreja.",
    points: [
      {
        title: "Um Legado Transmitido em Casa",
        bullets: [
          "A fé de Timóteo tem raízes na avó e na mãe",
          "Gerações anteriores de fé sincera preparam o caminho para os que vêm depois",
          "Um lar de fé genuína deixa marcas duradouras nos filhos",
        ],
      },
      {
        title: "Reacender o Dom Recebido",
        bullets: [
          "Paulo pede que Timóteo reacenda o dom de Deus que está nele",
          "Dons e chamados podem esfriar se não forem intencionalmente cultivados",
          "Reacender exige atenção e disciplina, não apenas esperar que aconteça",
        ],
      },
      {
        title: "Um Espírito de Poder, Amor e Moderação",
        bullets: [
          "'Deus não nos deu o espírito de temor, mas de poder, de amor e de moderação'",
          "O medo não deveria paralisar um jovem chamado por Deus",
          "Poder, amor e domínio próprio equipam o jovem para o chamado que recebeu",
        ],
      },
    ],
    applications: [
      "Agradeça a Deus hoje por alguém (avó, mãe, pai) que investiu fé genuína em você, e diga isso a essa pessoa se possível.",
      "Identifique um dom ou chamado que esfriou em você e tome uma atitude concreta para reacendê-lo esta semana.",
    ],
    conclusion_appeal:
      "Deus não te deu espírito de temor. Reacenda o dom que Ele colocou em você, apoiado no legado de fé que você recebeu.",
  },
  {
    slug: "o-caminho-a-verdade-e-a-vida",
    title: "O Caminho, a Verdade e a Vida",
    base_text: "João 14:6",
    category_id: "evangelistico",
    testament: "NT",
    short_description:
      "Jesus declara ser o único caminho até o Pai — uma afirmação exclusiva, mas também o convite mais generoso já feito.",
    central_idea: "Jesus não é um caminho entre muitos para Deus — Ele é o único caminho, a verdade e a vida.",
    short_introduction:
      "Diante da pergunta de Tomé sobre como conhecer o caminho, Jesus responde com uma das afirmações mais diretas de todo o Novo Testamento: 'Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai senão por mim'.",
    points: [
      {
        title: "O Único Caminho",
        bullets: [
          "Jesus não aponta para um caminho — Ele é o caminho",
          "Essa afirmação exclui outras rotas espirituais como suficientes por si mesmas",
          "Não é arrogância, é a única solução real para a separação entre Deus e o homem",
        ],
      },
      {
        title: "A Verdade em Meio a Tantas Opiniões",
        bullets: [
          "Num mundo de opiniões variadas, Jesus se apresenta como a Verdade absoluta",
          "Conhecer a Jesus é conhecer a realidade última sobre Deus e sobre nós mesmos",
          "A verdade de Jesus não muda com a cultura ou a época",
        ],
      },
      {
        title: "A Vida que Só Ele Oferece",
        bullets: [
          "Jesus não apenas mostra o caminho para a vida, Ele é a vida",
          "Fora dEle, há apenas existência; nEle, há vida abundante e eterna",
          "Ninguém chega ao Pai por mérito próprio, apenas através dEle",
        ],
      },
    ],
    applications: [
      "Se você ainda não decidiu seguir a Jesus como o único caminho até Deus, considere essa decisão hoje mesmo.",
      "Compartilhe esse versículo com alguém que está buscando sentido espiritual em diferentes lugares.",
    ],
    conclusion_appeal:
      "Jesus é o único caminho, mas é um caminho aberto para qualquer um que quiser vir. Você já andou por esse caminho?",
  },
  {
    slug: "todos-pecaram-e-necessitam-da-gloria-de-deus",
    title: "Todos Pecaram e Necessitam da Glória de Deus",
    base_text: "Romanos 3:23-24",
    category_id: "evangelistico",
    testament: "NT",
    short_description:
      "Paulo nivela toda a humanidade sob o mesmo diagnóstico — e oferece a mesma solução: a graça em Cristo Jesus.",
    central_idea:
      "Todos pecaram, mas todos também podem ser justificados gratuitamente pela graça, mediante a redenção em Cristo.",
    short_introduction:
      "Antes de qualquer religião, cultura ou moralidade pessoal, Paulo declara um diagnóstico universal: 'todos pecaram e destituídos estão da glória de Deus'. Mas o mesmo texto que revela o problema aponta imediatamente para a solução.",
    points: [
      {
        title: "Um Diagnóstico Universal",
        bullets: [
          "'Todos' pecaram — não há exceções baseadas em moralidade pessoal",
          "Nenhuma boa reputação humana alcança o padrão de glória de Deus",
          "Reconhecer isso é o primeiro passo para buscar a solução certa",
        ],
      },
      {
        title: "Justificados Gratuitamente",
        bullets: [
          "A justificação é 'gratuita', não conquistada",
          "'Pela sua graça' — o mérito não é nosso, é da bondade de Deus",
          "Ninguém pode se gabar de ter alcançado a salvação por esforço próprio",
        ],
      },
      {
        title: "Pela Redenção em Cristo Jesus",
        bullets: [
          "A justificação acontece 'mediante a redenção que há em Cristo Jesus'",
          "Redenção fala de um resgate pago — o preço foi a vida de Jesus",
          "Não há outro caminho de justificação além dessa redenção",
        ],
      },
    ],
    applications: [
      "Reconheça diante de Deus, sem minimizar, que você também está incluído nesse 'todos pecaram'.",
      "Receba hoje, pela fé, a justificação gratuita oferecida através da redenção em Cristo Jesus.",
    ],
    conclusion_appeal:
      "Todos precisam da graça de Deus — e ela está disponível gratuitamente através de Jesus. Você já a recebeu?",
  },
  {
    slug: "hoje-e-o-dia-da-salvacao",
    title: "Hoje é o Dia da Salvação",
    base_text: "2 Coríntios 6:2",
    category_id: "evangelistico",
    testament: "NT",
    short_description:
      "Paulo cita Isaías para lembrar que a oportunidade de responder ao chamado de Deus é agora, não depois.",
    central_idea:
      "A salvação não é uma oferta permanente e sem prazo — a Bíblia insiste que o tempo certo de responder é hoje.",
    short_introduction:
      "Paulo, citando o profeta Isaías, declara: 'eis aqui agora o tempo aceitável, eis aqui agora o dia da salvação'. Diante da tentação de adiar decisões espirituais, a Escritura insiste na urgência do agora.",
    points: [
      {
        title: "A Tentação de Adiar",
        bullets: [
          "É comum pensar em se decidir por Cristo 'mais tarde', 'quando as coisas se acalmarem'",
          "O adiamento espiritual raramente se resolve sozinho com o tempo",
          "Cada dia que passa sem decisão não é neutro, é uma escolha por continuar como se está",
        ],
      },
      {
        title: "A Urgência do 'Agora'",
        bullets: [
          "O texto repete 'agora' duas vezes, reforçando a urgência",
          "Não há garantia de um 'amanhã' mais conveniente para decidir",
          "A graça de Deus está disponível hoje, de forma concreta e acessível",
        ],
      },
      {
        title: "Um Convite Aberto e Presente",
        bullets: [
          "'Não recebais em vão a graça de Deus' — o convite pode ser rejeitado ou ignorado",
          "A salvação não é apenas uma verdade teórica, é uma decisão prática a ser tomada",
          "Deus continua estendendo a oportunidade a cada pessoa, a cada dia",
        ],
      },
    ],
    applications: [
      "Se você tem adiado uma decisão de fé, não deixe para depois — responda ao chamado de Deus hoje mesmo.",
      "Ore por alguém que você sabe que está adiando essa decisão, e busque uma oportunidade de conversar com essa pessoa esta semana.",
    ],
    conclusion_appeal: "Não existe momento perfeito no futuro — o tempo é agora. Hoje é o dia da salvação para você.",
  },
  {
    slug: "a-ponte-entre-deus-e-o-homem",
    title: "A Ponte Entre Deus e o Homem",
    base_text: "1 Timóteo 2:5-6",
    category_id: "evangelistico",
    testament: "NT",
    short_description:
      "Paulo apresenta Jesus como o único Mediador entre Deus e os homens, que se deu em resgate por todos.",
    central_idea:
      "Jesus Cristo, homem e Deus, é o único Mediador capaz de reconciliar a humanidade pecadora com o Deus santo.",
    short_introduction:
      "A separação entre Deus e o homem, causada pelo pecado, exigia alguém capaz de representar as duas partes — plenamente Deus e plenamente homem. Paulo apresenta Jesus exatamente como esse Mediador único.",
    points: [
      {
        title: "A Necessidade de um Mediador",
        bullets: [
          "O pecado criou uma separação real entre Deus e a humanidade",
          "Ninguém pode se aproximar de Deus por conta própria, sem intermediário",
          "A humanidade precisava de alguém que representasse ambos os lados",
        ],
      },
      {
        title: "Um Só Mediador",
        bullets: [
          "'Há um só Deus e um só Mediador entre Deus e os homens'",
          "Jesus, sendo plenamente Deus e plenamente homem, é o único qualificado para essa função",
          "Não há outros mediadores necessários ou suficientes além dEle",
        ],
      },
      {
        title: "O Resgate Pago por Todos",
        bullets: [
          "Jesus 'se deu a si mesmo em preço de redenção por todos'",
          "A oferta da salvação em Cristo está disponível a toda a humanidade",
          "O resgate já foi pago — resta a cada pessoa recebê-lo pela fé",
        ],
      },
    ],
    applications: [
      "Reconheça hoje que você não precisa de nenhum outro intermediário além de Jesus para se aproximar de Deus.",
      "Compartilhe essa verdade com alguém que talvez acredite que precisa de méritos próprios ou de outros intermediários para chegar a Deus.",
    ],
    conclusion_appeal:
      "Existe uma ponte já construída entre você e Deus: Jesus Cristo. Você já atravessou essa ponte pela fé?",
  },
  {
    slug: "o-pao-partido-o-sangue-derramado",
    title: "O Pão Partido, o Sangue Derramado",
    base_text: "Mateus 26:26-28",
    category_id: "santa-ceia",
    testament: "NT",
    short_description:
      "Na última ceia, Jesus institui um memorial simples e profundo: pão e vinho representando Seu corpo e sangue.",
    central_idea: "A Ceia do Senhor nos lembra, de forma tangível, o preço pago por Jesus para nossa redenção.",
    short_introduction:
      "Durante a Páscoa judaica, Jesus toma o pão e o cálice e dá um novo significado a esses elementos: Seu corpo partido e Seu sangue derramado, em favor de muitos, para remissão dos pecados.",
    points: [
      {
        title: "O Pão: Seu Corpo Partido",
        bullets: [
          "Jesus toma o pão, agradece, parte e dá aos discípulos",
          "O partir do pão simboliza o sofrimento físico de Cristo por nós",
          "Cada vez que participamos, somos lembrados do preço pago em Seu corpo",
        ],
      },
      {
        title: "O Cálice: Seu Sangue Derramado",
        bullets: [
          "'Isto é o meu sangue, o sangue do novo testamento'",
          "O sangue derramado sela uma nova aliança entre Deus e Seu povo",
          "É 'derramado para remissão dos pecados' — perdão comprado a um preço altíssimo",
        ],
      },
      {
        title: "Um Memorial para Ser Repetido",
        bullets: [
          "Jesus institui a Ceia como prática contínua da igreja",
          "Cada celebração renova a memória viva do sacrifício de Cristo",
          "A Ceia aponta para trás, à cruz, e para frente, à volta de Jesus",
        ],
      },
    ],
    applications: [
      "Antes de participar da próxima Ceia, reserve um tempo para refletir sinceramente sobre o que o corpo e o sangue de Cristo significam para você.",
      "Agradeça hoje, especificamente, pelo preço que Jesus pagou por você na cruz.",
    ],
    conclusion_appeal:
      "O pão e o cálice não são apenas símbolos religiosos — são lembretes vivos do amor que pagou por você. Participe com o coração.",
  },
  {
    slug: "examinando-se-antes-da-mesa",
    title: "Examinando-se Antes da Mesa",
    base_text: "1 Coríntios 11:27-29",
    category_id: "santa-ceia",
    testament: "NT",
    short_description:
      "Paulo alerta os coríntios sobre a importância de se examinar antes de participar da Ceia do Senhor indignamente.",
    central_idea:
      "Participar da Ceia do Senhor exige um exame sincero do coração, não apenas um ritual repetido sem reflexão.",
    short_introduction:
      "Na igreja de Corinto, a Ceia estava sendo celebrada de forma descuidada e desonrosa. Paulo corrige essa prática, ensinando que participar dignamente exige exame pessoal, e não apenas presença física ao redor da mesa.",
    points: [
      {
        title: "O Perigo de Participar Indignamente",
        bullets: [
          "Comer o pão ou beber o cálice indignamente traz responsabilidade pelo corpo e sangue do Senhor",
          "A Ceia não é um ritual vazio — carrega peso espiritual real",
          "Descuido espiritual na Ceia não é uma questão neutra",
        ],
      },
      {
        title: "O Chamado ao Exame Pessoal",
        bullets: [
          "'Examine-se, porém, o homem a si mesmo'",
          "O exame envolve avaliar pecados não confessados, relações rompidas e atitude do coração",
          "Esse exame deve preceder a participação, não substituí-la",
        ],
      },
      {
        title: "Discernindo o Corpo do Senhor",
        bullets: [
          "Paulo fala em discernir o corpo do Senhor ao participar",
          "Isso inclui reconhecer o sacrifício de Cristo e também a unidade do corpo, a igreja",
          "Participar com reverência honra tanto a cruz quanto a comunidade de fé",
        ],
      },
    ],
    applications: [
      "Antes da próxima Ceia, reserve um tempo de exame pessoal, confessando pecados e buscando reconciliação onde for necessário.",
      "Reflita se há alguma relação rompida na igreja que você precisa restaurar antes de participar da mesa do Senhor.",
    ],
    conclusion_appeal: "A mesa do Senhor pede reverência, não apenas presença. Examine seu coração antes de participar.",
  },
  {
    slug: "a-ultima-ceia-um-novo-concerto",
    title: "A Última Ceia: Um Novo Concerto",
    base_text: "Lucas 22:14-20",
    category_id: "santa-ceia",
    testament: "NT",
    short_description:
      "Lucas registra o momento em que Jesus estabelece uma nova aliança, selada em Seu próprio sangue, na última ceia com os discípulos.",
    central_idea:
      "A última ceia marca o início de uma nova aliança entre Deus e Seu povo, selada não em animais, mas no próprio sangue de Cristo.",
    short_introduction:
      "Jesus reúne os discípulos para uma última refeição antes da cruz, e ali declara algo revolucionário: 'este cálice é o novo concerto no meu sangue, que por vós se derrama'. Um novo capítulo na relação entre Deus e a humanidade estava sendo aberto.",
    points: [
      {
        title: "O Desejo de Jesus por Esse Momento",
        bullets: [
          "'Tenho desejado ardentemente comer convosco esta páscoa'",
          "Jesus valorizava profundamente esse momento de comunhão antes de Sua morte",
          "A Ceia nasce de um desejo de proximidade, não de mera obrigação ritual",
        ],
      },
      {
        title: "Da Antiga para a Nova Aliança",
        bullets: [
          "A páscoa judaica apontava para a libertação do Egito; a nova ceia aponta para a libertação do pecado",
          "'Novo concerto' sinaliza uma mudança definitiva na forma como Deus se relaciona com Seu povo",
          "O sangue de Cristo substitui o sangue dos sacrifícios antigos, de uma vez por todas",
        ],
      },
      {
        title: "Um Convite à Memória Contínua",
        bullets: [
          "'Fazei isto em memória de mim'",
          "A repetição da Ceia mantém viva a lembrança da nova aliança",
          "Cada celebração reafirma nossa participação nessa aliança pelo sangue de Cristo",
        ],
      },
    ],
    applications: [
      "Reflita sobre a diferença entre viver sob a antiga aliança de regras e viver sob a nova aliança da graça selada por Cristo.",
      "Na próxima Ceia, participe conscientemente como alguém que faz parte dessa nova aliança.",
    ],
    conclusion_appeal:
      "Você faz parte de uma nova aliança, selada com o próprio sangue de Cristo. Participe da Ceia com essa realidade em mente.",
  },
  {
    slug: "ano-novo-esquecendo-o-que-fica-para-tras",
    title: "Ano Novo: Esquecendo o Que Fica Para Trás",
    base_text: "Filipenses 3:13-14",
    category_id: "datas-especiais",
    testament: "NT",
    short_description:
      "Paulo ensina a esquecer o que fica para trás e prosseguir para o alvo — uma mensagem oportuna para o início de um novo ano.",
    central_idea:
      "Um novo ano é oportunidade de deixar o passado — erros e conquistas — para trás e prosseguir com foco no alvo que Deus tem para nós.",
    short_introduction:
      "No limiar de um novo ano, muitos carregam o peso de arrependimentos ou se acomodam em conquistas passadas. Paulo aponta um caminho diferente: esquecer o que ficou para trás e prosseguir, com determinação, para o alvo do chamado de Deus.",
    points: [
      {
        title: "Esquecendo o Que Fica para Trás",
        bullets: [
          "Paulo não ignora seu passado, mas se recusa a ser definido por ele",
          "Tanto os fracassos quanto os sucessos passados podem prender o olhar do próximo passo",
          "Esquecer, no sentido bíblico, é deixar de permitir que o passado dite o presente",
        ],
      },
      {
        title: "Avançando para o Que Está Diante",
        bullets: [
          "'Avançando para o que está diante de mim' — o foco de Paulo é para frente",
          "O crescimento espiritual exige movimento contínuo, não acomodação",
          "Um novo ano é uma oportunidade concreta para esse avanço",
        ],
      },
      {
        title: "Prosseguindo para o Alvo",
        bullets: [
          "'Prossigo para o alvo, pelo prêmio da soberana vocação de Deus em Cristo Jesus'",
          "O alvo cristão não é genérico, é o chamado específico de Deus para cada um",
          "Prosseguir exige intencionalidade, não apenas boas intenções de início de ano",
        ],
      },
    ],
    applications: [
      "Escreva o que você precisa 'esquecer' (erro ou conquista) para avançar de coração leve neste novo ano.",
      "Defina um alvo espiritual concreto para este ano, alinhado com o chamado de Deus para sua vida.",
    ],
    conclusion_appeal: "Este novo ano pode ser marcado por avanço, não por peso do passado. Para onde você vai prosseguir?",
  },
  {
    slug: "pascoa-ele-nao-esta-aqui-ressuscitou",
    title: "Páscoa: Ele Não Está Aqui, Ressuscitou",
    base_text: "Lucas 24:1-6",
    category_id: "datas-especiais",
    testament: "NT",
    short_description:
      "As mulheres foram ao túmulo esperando encontrar um corpo morto e encontraram a maior notícia da história: Ele ressuscitou.",
    central_idea:
      "A ressurreição de Jesus é o fundamento de toda a fé cristã — Ele não está morto, está vivo.",
    short_introduction:
      "No primeiro dia da semana, mulheres foram ao túmulo com especiarias, prontas para lidar com a morte. Em vez disso, encontraram a pedra removida e ouviram a declaração que mudaria a história: 'Por que buscais entre os mortos aquele que vive?'.",
    points: [
      {
        title: "A Expectativa da Morte",
        bullets: [
          "As mulheres foram ao túmulo esperando encontrar um corpo",
          "Elas ainda não haviam compreendido totalmente as promessas de Jesus sobre ressuscitar",
          "É comum irmos a Deus esperando apenas o que já conhecemos, sem esperar um milagre maior",
        ],
      },
      {
        title: "A Surpresa da Ressurreição",
        bullets: [
          "O túmulo estava vazio — a pedra já havia sido removida",
          "'Ele não está aqui, mas ressuscitou' — a declaração mais impactante da história",
          "A ressurreição confirma tudo o que Jesus havia dito sobre Si mesmo",
        ],
      },
      {
        title: "O Significado para Nós Hoje",
        bullets: [
          "A ressurreição prova que a morte não teve a última palavra sobre Jesus",
          "Nossa esperança de vida eterna se fundamenta nesse evento histórico",
          "Porque Ele vive, também nós viveremos",
        ],
      },
    ],
    applications: [
      "Reflita hoje sobre uma área da sua vida onde você tem 'buscado entre os mortos' — soluções sem vida — em vez de confiar no Deus que ressuscita.",
      "Compartilhe com alguém, nesta época de Páscoa, o significado real da ressurreição de Jesus.",
    ],
    conclusion_appeal:
      "A tumba está vazia. Jesus está vivo. Essa é a base de toda esperança que temos — celebre isso hoje.",
  },
  {
    slug: "dia-das-maes-a-mulher-virtuosa",
    title: "Dia das Mães: A Mulher Virtuosa",
    base_text: "Provérbios 31:25-30",
    category_id: "datas-especiais",
    testament: "AT",
    short_description:
      "O retrato da mulher virtuosa em Provérbios 31 celebra força, sabedoria e temor do Senhor — não perfeição impossível.",
    central_idea:
      "A verdadeira honra de uma mulher, especialmente de uma mãe, está no seu caráter e no seu temor a Deus, não em padrões impossíveis.",
    short_introduction:
      "Provérbios 31 descreve uma mulher de força e dignidade, sabedoria e bondade — um retrato que, mais do que uma lista de tarefas, celebra o caráter formado pelo temor do Senhor.",
    points: [
      {
        title: "Força e Dignidade como Vestimenta",
        bullets: [
          "'Força e dignidade são os seus vestidos'",
          "Essa força não é apenas física, é resiliência de caráter",
          "Mulheres que enfrentam desafios diários refletem essa força descrita",
        ],
      },
      {
        title: "Sabedoria e Bondade na Fala",
        bullets: [
          "'Abre a sua boca com sabedoria, e a lei da bondade está na sua língua'",
          "A forma de falar revela o caráter interior",
          "Mães que ensinam com bondade e sabedoria deixam marcas duradouras nos filhos",
        ],
      },
      {
        title: "O Temor do Senhor como Verdadeiro Louvor",
        bullets: [
          "'Mas a mulher que teme ao Senhor, essa será louvada'",
          "A beleza e a graça são passageiras, mas o temor do Senhor permanece",
          "O maior elogio a uma mãe não é sua aparência, é seu caráter diante de Deus",
        ],
      },
    ],
    applications: [
      "Se você é mãe, seja lembrada hoje de que seu maior legado não é a perfeição, é o temor do Senhor vivido diante dos filhos.",
      "Honre hoje, com uma palavra ou gesto concreto, uma mulher que refletiu esse caráter na sua vida.",
    ],
    conclusion_appeal:
      "O maior elogio que uma mulher pode receber não é sobre aparência, é sobre caráter. Celebre hoje as mulheres que temem ao Senhor em sua vida.",
  },
  {
    slug: "natal-o-verbo-se-fez-carne",
    title: "Natal: O Verbo Se Fez Carne",
    base_text: "João 1:1-14",
    category_id: "datas-especiais",
    testament: "NT",
    short_description:
      "João apresenta o nascimento de Jesus não como o início de uma vida, mas como o Verbo eterno se fazendo carne entre nós.",
    central_idea:
      "O Natal celebra o momento em que Deus, o Verbo eterno, escolheu se fazer carne e habitar entre nós.",
    short_introduction:
      "Enquanto Mateus e Lucas contam a história do nascimento de Jesus com pastores e manjedoura, João vai além: ele revela quem realmente nasceu naquela noite — o Verbo que estava com Deus, e que era Deus, se fazendo carne.",
    points: [
      {
        title: "O Verbo Eterno",
        bullets: [
          "'No princípio era o Verbo... e o Verbo era Deus'",
          "Jesus não começou a existir em Belém — Ele é eterno",
          "O Natal celebra a encarnação, não a criação, de Jesus",
        ],
      },
      {
        title: "A Decisão de Habitar Entre Nós",
        bullets: [
          "'E o Verbo se fez carne, e habitou entre nós'",
          "Deus escolheu se aproximar, não permanecer distante",
          "A encarnação é o maior ato de humildade e amor já registrado",
        ],
      },
      {
        title: "Luz que as Trevas Não Venceram",
        bullets: [
          "'A luz resplandece nas trevas, e as trevas não prevaleceram contra ela'",
          "Jesus veio como luz num mundo de escuridão espiritual",
          "Quem O recebe ganha o direito de se tornar filho de Deus",
        ],
      },
    ],
    applications: [
      "Nesta época de Natal, celebre não apenas o nascimento histórico, mas o significado da encarnação: Deus se aproximando de você.",
      "Compartilhe com sua família o verdadeiro significado do Natal, para além das tradições culturais.",
    ],
    conclusion_appeal:
      "O Natal é sobre Deus se aproximar de nós ao ponto de se fazer carne. Já recebeu esse presente maior que qualquer outro?",
  },
];

const rows = outlines.map((o) => ({ ...o, is_seed: true }));

console.log(`Inserindo ${rows.length} esboços...`);
const { data, error } = await admin.from("ready_outlines").insert(rows).select("slug");
if (error) {
  console.error("Erro:", error);
  process.exit(1);
}
console.log(`Inseridos com sucesso: ${data.length}`);
