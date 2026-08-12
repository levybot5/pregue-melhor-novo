-- Etapa "Pregações Prontas + Esboços Prontos": acervo editorial fixo
-- (não gerado por IA) + favoritos por usuário.
--
-- Mercado Pago continua pausado — esta migration não toca em
-- subscriptions/usage_events/generation_locks nem em nenhuma coluna
-- relacionada a pagamento.

-- =====================================================================
-- 1. CATEGORIAS
-- =====================================================================
-- Tabela simples (não enum) de propósito: permitir adicionar categorias
-- depois — inclusive por um futuro painel admin — sem migration nova.
create table if not exists public.content_categories (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

insert into public.content_categories (id, label, sort_order) values
  ('fe', 'Fé', 1),
  ('familia', 'Família', 2),
  ('oracao', 'Oração', 3),
  ('espirito-santo', 'Espírito Santo', 4),
  ('salvacao', 'Salvação', 5),
  ('esperanca', 'Esperança', 6),
  ('santidade', 'Santidade', 7),
  ('vida-crista', 'Vida Cristã', 8),
  ('jovens', 'Jovens', 9),
  ('evangelistico', 'Evangelístico', 10),
  ('santa-ceia', 'Santa Ceia', 11),
  ('datas-especiais', 'Datas Especiais', 12)
on conflict (id) do nothing;

-- =====================================================================
-- 2. PREGAÇÕES PRONTAS
-- =====================================================================
-- Conteúdo editorial fixo (não gerado por IA, nunca chamado a partir
-- do frontend). "points" é jsonb para não exigir migration a cada
-- ajuste de quantidade/forma dos pontos.
create table if not exists public.ready_sermons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  base_text text not null,
  category_id text not null references public.content_categories(id),
  testament text check (testament in ('AT', 'NT')),
  short_description text not null,
  introduction text not null,
  points jsonb not null,
  application text not null,
  conclusion text not null,
  appeal text,
  prayer text,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ready_sermons_category_id_idx on public.ready_sermons (category_id);

drop trigger if exists set_ready_sermons_updated_at on public.ready_sermons;
create trigger set_ready_sermons_updated_at
  before update on public.ready_sermons
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- 3. ESBOÇOS PRONTOS
-- =====================================================================
-- Mais compacto que Pregação Pronta por natureza: pontos já em formato
-- de bullets, sem contexto bíblico nem oração de fechamento.
create table if not exists public.ready_outlines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  base_text text not null,
  category_id text not null references public.content_categories(id),
  testament text check (testament in ('AT', 'NT')),
  short_description text not null,
  central_idea text not null,
  short_introduction text not null,
  points jsonb not null,
  applications jsonb not null,
  conclusion_appeal text,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ready_outlines_category_id_idx on public.ready_outlines (category_id);

drop trigger if exists set_ready_outlines_updated_at on public.ready_outlines;
create trigger set_ready_outlines_updated_at
  before update on public.ready_outlines
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- 4. FAVORITOS
-- =====================================================================
-- Só a relação, nunca uma cópia do conteúdo (item 12 da etapa).
-- content_id aponta para ready_sermons.id ou ready_outlines.id conforme
-- content_type; sem FK direta porque é condicional a essa coluna — a
-- integridade é garantida pela camada de aplicação, que só grava
-- favoritos a partir de slugs/ids já validados nas tabelas acima.
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('pregacao_pronta', 'esboco_pronto')),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);

-- =====================================================================
-- 5. RLS
-- =====================================================================
-- Categorias e conteúdo editorial: leitura para qualquer usuário
-- autenticado (mesmo padrão de acesso da Biblioteca pessoal — leitura
-- não é bloqueada por status de assinatura). Sem escrita via RLS: quem
-- gerencia esse conteúdo hoje é a migration/seed; um futuro painel
-- admin passaria a escrever com o client de service role.
alter table public.content_categories enable row level security;

drop policy if exists "select_content_categories" on public.content_categories;
create policy "select_content_categories"
  on public.content_categories
  for select
  to authenticated
  using (true);

alter table public.ready_sermons enable row level security;

drop policy if exists "select_ready_sermons" on public.ready_sermons;
create policy "select_ready_sermons"
  on public.ready_sermons
  for select
  to authenticated
  using (true);

alter table public.ready_outlines enable row level security;

drop policy if exists "select_ready_outlines" on public.ready_outlines;
create policy "select_ready_outlines"
  on public.ready_outlines
  for select
  to authenticated
  using (true);

-- Favoritos: isolados por dono, igual a subscriptions/contents. Não
-- altera RLS de nenhuma tabela pessoal existente.
alter table public.favorites enable row level security;

drop policy if exists "select_own_favorites" on public.favorites;
create policy "select_own_favorites"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert_own_favorites" on public.favorites;
create policy "insert_own_favorites"
  on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_favorites" on public.favorites;
create policy "delete_own_favorites"
  on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- 6. SEED (conteúdo de demonstração, is_seed = true)
-- =====================================================================
-- Quantidade pequena só para validar a experiência ponta a ponta
-- (item 13 da etapa). A arquitetura (colunas + jsonb) já suporta
-- dezenas/centenas de itens sem mudar componente nenhum.

insert into public.ready_sermons
  (slug, title, base_text, category_id, testament, short_description, introduction, points, application, conclusion, appeal, prayer, is_seed)
values
(
  'o-senhor-e-meu-pastor',
  'O Senhor é o Meu Pastor',
  'Salmo 23',
  'fe',
  'AT',
  'Uma mensagem sobre confiança e provisão de Deus em todas as fases da vida.',
  'Poucos textos bíblicos consolam tanto quanto o Salmo 23. Davi, que foi pastor antes de ser rei, descreve Deus com a imagem mais simples e mais profunda possível: alguém que cuida, guia e protege. Este salmo não é sobre ausência de dificuldades, mas sobre a presença de Deus dentro delas.',
  '[
    {"title": "A provisão que basta", "text": "\"Nada me faltará\" não significa ausência de necessidades, mas a certeza de que o Pastor supre o essencial. O foco muda da falta para a suficiência de Deus.", "items": ["Descanso em pastos verdejantes", "Águas tranquilas para a alma", "Restauração no tempo certo"]},
    {"title": "A presença no vale", "text": "O vale da sombra da morte não é o fim do caminho — é uma passagem. O medo diminui não porque o perigo desaparece, mas porque a presença de Deus caminha ao lado.", "items": ["A vara que corrige", "O cajado que defende", "Não há motivo para temer"]},
    {"title": "A mesa e a bondade", "text": "Deus prepara mesa diante dos adversários e unge a cabeça com óleo — sinais de honra em meio à oposição. Bondade e misericórdia seguem o crente todos os dias.", "items": ["Honra mesmo sob pressão", "Bondade e misericórdia como companheiras diárias", "A casa do Senhor como destino final"]}
  ]'::jsonb,
  'Identifique em que "vale" você está agora e lembre-se de que o Pastor não promete ausência de dificuldade, mas presença constante nela.',
  'Quem tem o Pastor não tem tudo o que quer, mas tem tudo o que precisa.',
  'Se hoje o medo tem falado mais alto que a fé, entregue essa área ao Bom Pastor.',
  'Senhor, obrigado por seres nosso Pastor. Ensina-nos a confiar mesmo no vale. Amém.',
  true
),
(
  'a-fe-que-agrada-a-deus',
  'A Fé que Agrada a Deus',
  'Hebreus 11:1-6',
  'fe',
  'NT',
  'Um estudo prático sobre o que é fé bíblica e por que ela agrada a Deus.',
  'Fé é uma das palavras mais usadas e menos compreendidas na vida cristã. Hebreus 11 define fé não como um sentimento, mas como certeza e convicção — e mostra, por meio de exemplos, como ela se traduz em ação prática.',
  '[
    {"title": "Fé é substância, não sentimento", "text": "\"Fé é a certeza das coisas que se esperam, a convicção de fatos que não se veem\" — não é uma emoção passageira, é uma postura firme diante das promessas de Deus.", "items": ["Certeza, não dúvida disfarçada", "Convicção que sustenta antes de ver", "Base para toda a vida cristã"]},
    {"title": "Sem fé é impossível agradar a Deus", "text": "O texto afirma que sem fé é impossível agradar a Deus. Isso eleva a fé de opcional para essencial no relacionamento com Ele.", "items": ["Fé reconhece que Deus existe", "Fé crê que Ele recompensa os que o buscam", "Fé precede a obediência"]},
    {"title": "Fé se prova em ação", "text": "Os exemplos do capítulo (Abel, Enoque, Noé) mostram fé que se manifesta em atitude concreta, não apenas em declaração de crença.", "items": ["Abel ofereceu com fé", "Enoque andou com Deus", "Noé construiu antes de ver a chuva"]}
  ]'::jsonb,
  'Identifique uma área onde você tem esperado "ver para crer" e inverta isso, agindo em fé primeiro.',
  'A fé bíblica não elimina a incerteza — ela age apesar dela, confiando no caráter de Deus.',
  'Dê um passo de fé esta semana em algo que você tem adiado por medo.',
  null,
  true
),
(
  'familia-conforme-o-proposito-de-deus',
  'Família Conforme o Propósito de Deus',
  'Efésios 5:21-6:4',
  'familia',
  'NT',
  'Princípios bíblicos para relacionamentos saudáveis dentro do lar.',
  'A família é a primeira instituição criada por Deus, anterior até à igreja. Efésios 5 e 6 trazem instruções práticas para cônjuges, pais e filhos viverem em ordem e amor dentro do lar.',
  '[
    {"title": "Submissão mútua em amor", "text": "Antes de instruções específicas, Paulo pede submissão mútua \"por temor a Cristo\" — um princípio que rege toda relação no lar.", "items": ["Submissão não é hierarquia de valor", "É posição de serviço, não de inferioridade", "Começa com Cristo como referência"]},
    {"title": "Maridos que amam como Cristo amou", "text": "O padrão para o marido não é a cultura, é a cruz — um amor que se entrega, não que exige.", "items": ["Amor sacrificial, não autoritário", "Cuidar da esposa como do próprio corpo", "Liderança que serve"]},
    {"title": "Pais que não provocam à ira", "text": "A instrução aos pais equilibra autoridade com cuidado: criar os filhos \"na disciplina e admoestação do Senhor\", sem provocá-los.", "items": ["Disciplina com propósito, não com raiva", "Presença antes de regras", "Formação espiritual como prioridade"]}
  ]'::jsonb,
  'Casais: escolham um gesto de serviço no casamento esta semana. Pais: reservem um momento intencional com os filhos.',
  'A família bíblica não é perfeita, é intencional — construída dia após dia com amor que serve.',
  'Comprometa-se hoje a viver esse padrão de amor dentro da sua casa, começando por uma atitude concreta esta semana.',
  'Senhor, ajuda nossas famílias a refletirem o Teu amor. Cura o que está ferido e fortalece o que já é saudável. Amém.',
  true
),
(
  'o-poder-da-oracao-perseverante',
  'O Poder da Oração Perseverante',
  'Lucas 18:1-8',
  'oracao',
  'NT',
  'A parábola da viúva insistente e o que ela ensina sobre perseverar na oração.',
  'Jesus contou a parábola do juiz injusto e da viúva insistente com um propósito claro, declarado pelo próprio texto: "que era necessário orar sempre, e nunca desfalecer". Perseverança na oração não é sobre convencer a Deus, mas sobre nossa confiança nEle.',
  '[
    {"title": "Um juiz injusto, um Deus justo", "text": "Se até um juiz sem caráter atende por insistência, quanto mais o Deus justo e bom responde aos que clamam a Ele dia e noite.", "items": ["Contraste proposital na parábola", "Deus não é como o juiz injusto", "Ele já se importa antes de sermos insistentes"]},
    {"title": "Perseverar sem desfalecer", "text": "O texto reconhece que a oração pode cansar. Perseverar não é sobre repetir palavras, é sobre não desistir de confiar.", "items": ["Cansaço espiritual é real", "Perseverança é decisão, não sentimento", "Deus não ignora o tempo de espera"]},
    {"title": "A fé que Jesus busca encontrar", "text": "A pergunta final de Jesus — \"quando vier o Filho do homem, achará fé na terra?\" — conecta perseverança na oração com perseverança na fé.", "items": ["Oração revela o estado da fé", "Desistir de orar é sintoma, não causa", "Fé perseverante é o alvo"]}
  ]'::jsonb,
  'Retome um pedido de oração que você já abandonou e persista nele por mais uma semana, com um diário simples de oração.',
  'Deus não precisa da nossa insistência para agir — mas a nossa insistência revela e fortalece a nossa fé.',
  'Escolha hoje uma oração que você parou de fazer e recomece.',
  'Pai, perdoa-nos quando desistimos de orar. Renova nossa fé para perseverar até a resposta. Amém.',
  true
),
(
  'cheios-do-espirito',
  'Cheios do Espírito',
  'Atos 2:1-4; Efésios 5:18',
  'espirito-santo',
  'NT',
  'O que significa ser cheio do Espírito Santo no dia a dia da fé.',
  'Em Atos 2, os discípulos são cheios do Espírito Santo e tudo muda: coragem, clareza, poder. Em Efésios, Paulo trata isso não como evento único, mas como um mandamento contínuo: "enchei-vos do Espírito".',
  '[
    {"title": "Um evento que muda tudo", "text": "O Pentecostes não foi apenas um fenômeno sobrenatural — foi o início de uma igreja transformada, capaz de pregar com ousadia o que antes temia dizer.", "items": ["Discípulos temerosos tornam-se ousados", "O Espírito capacita para a missão", "Não é sobre experiência, é sobre propósito"]},
    {"title": "Um mandamento contínuo", "text": "Efésios usa o tempo verbal que indica ação contínua: \"sede cheios\", não \"fostes cheios uma vez\". É um convite diário, não um evento único do passado.", "items": ["Enchimento é contínuo, não pontual", "Contraste com embriaguez: outro tipo de controle", "Depende de submissão diária"]},
    {"title": "O fruto visível do enchimento", "text": "Ser cheio do Espírito não se prova apenas por manifestação externa, mas pelo caráter e pelos relacionamentos que seguem no texto — louvor, gratidão, submissão mútua.", "items": ["Louvor que flui naturalmente", "Gratidão em toda circunstância", "Relacionamentos transformados"]}
  ]'::jsonb,
  'Avalie: o que tem controlado seus pensamentos e atitudes essa semana — o Espírito ou outra coisa?',
  'Ser cheio do Espírito não é um troféu espiritual, é uma necessidade diária para viver como Deus chama.',
  'Peça hoje, de forma simples e sincera, para ser cheio do Espírito Santo outra vez.',
  'Espírito Santo, enche-nos hoje. Temos sede da Tua presença e do Teu poder. Amém.',
  true
)
on conflict (slug) do nothing;

insert into public.ready_outlines
  (slug, title, base_text, category_id, testament, short_description, central_idea, short_introduction, points, applications, conclusion_appeal, is_seed)
values
(
  'as-bemaventurancas',
  'As Bem-Aventuranças',
  'Mateus 5:1-12',
  'vida-crista',
  'NT',
  'O caráter do Reino de Deus revelado em atitudes que o mundo considera fraqueza.',
  'O caráter do Reino de Deus se revela em atitudes que o mundo considera fraqueza.',
  'Jesus abre o Sermão do Monte redefinindo o que é "bem-aventurado" — não é ausência de dor, é a presença do favor de Deus em meio a ela.',
  '[
    {"title": "Pobres em espírito e mansos", "bullets": ["Reconhecem sua necessidade de Deus", "Não confiam na própria força", "Recebem o Reino como presente, não conquista"]},
    {"title": "Os que choram e têm fome de justiça", "bullets": ["A dor tem lugar na espiritualidade genuína", "Fome de justiça não se satisfaz com meias-medidas", "Deus consola e sacia"]},
    {"title": "Misericordiosos, puros e pacificadores", "bullets": ["Misericórdia recebida gera misericórdia oferecida", "Pureza de coração muda a forma de ver Deus", "Pacificadores refletem o caráter de filhos de Deus"]}
  ]'::jsonb,
  '["Escolha uma bem-aventurança para viver conscientemente esta semana", "Identifique onde você tem buscado força própria em vez de depender de Deus"]'::jsonb,
  'Viva o Reino agora — não espere condições perfeitas para refletir o caráter de Cristo.',
  true
),
(
  'a-armadura-de-deus',
  'A Armadura de Deus',
  'Efésios 6:10-18',
  'fe',
  'NT',
  'Cada peça da armadura espiritual e a provisão de Deus para o combate cristão.',
  'A vida cristã envolve um combate espiritual real, e Deus supre tudo o que é necessário para resistir.',
  'Paulo encerra Efésios com uma imagem militar: o crente está em guerra, mas não desarmado. Cada peça da armadura representa uma provisão espiritual concreta.',
  '[
    {"title": "Verdade e justiça", "bullets": ["O cinturão da verdade sustenta tudo", "A couraça da justiça protege o coração", "Integridade é defesa, não decoração"]},
    {"title": "Paz e fé", "bullets": ["Calçados com a disposição do evangelho da paz", "O escudo da fé apaga os dardos inflamados", "Fé ativa, não passiva"]},
    {"title": "Salvação e Palavra", "bullets": ["O capacete da salvação protege a mente", "A espada do Espírito é a Palavra de Deus", "Ataque e defesa vêm da mesma fonte"]}
  ]'::jsonb,
  '["Identifique qual peça da armadura você tem negligenciado", "Substitua um hábito de ansiedade por um momento diário na Palavra"]'::jsonb,
  'Vista a armadura hoje — a batalha é real, mas você não enfrenta sozinho.',
  true
),
(
  'chamados-para-servir',
  'Chamados para Servir',
  'João 13:1-17',
  'jovens',
  'NT',
  'Jesus redefine grandeza como serviço ao lavar os pés dos discípulos.',
  'Jesus redefine grandeza como serviço, não como posição.',
  'Antes da Páscoa, Jesus lava os pés dos discípulos — um gesto reservado a escravos — e transforma esse ato em exemplo permanente de liderança.',
  '[
    {"title": "O Mestre que se ajoelha", "bullets": ["Jesus sabia quem era e mesmo assim serviu", "Segurança de identidade permite servir sem medo", "Grandeza verdadeira não precisa de reconhecimento"]},
    {"title": "Um exemplo, não só uma lição", "bullets": ["\"Fiz para que também vós façais\" — é modelo, não teoria", "Serviço é linguagem universal do amor cristão", "Não há tarefa pequena demais para quem ama"]},
    {"title": "Bem-aventurados os que praticam", "bullets": ["Saber não basta — praticar é o alvo", "A bênção está na ação, não só no conhecimento", "Serviço constrói comunidade genuína"]}
  ]'::jsonb,
  '["Encontre uma forma prática de servir alguém esta semana, sem esperar reconhecimento", "Pergunte: onde tenho buscado posição em vez de servir?"]'::jsonb,
  'Sirva como Jesus serviu — de joelhos, sem cálculo, por amor.',
  true
),
(
  'em-memoria-dele',
  'Em Memória Dele',
  '1 Coríntios 11:23-26',
  'santa-ceia',
  'NT',
  'A Ceia do Senhor como memória, proclamação e exame do coração.',
  'A Ceia do Senhor é memória, proclamação e exame — não um ritual vazio.',
  'Paulo relembra a instituição da Ceia recebida "do Senhor" e a conecta a três dimensões: lembrar o sacrifício de Cristo, proclamar Sua morte, e examinar o próprio coração.',
  '[
    {"title": "Memória", "bullets": ["\"Fazei isto em memória de mim\"", "Memória ativa, não nostalgia passiva", "O pão e o cálice apontam para a cruz"]},
    {"title": "Proclamação", "bullets": ["\"Anunciais a morte do Senhor\"", "A Ceia prega o evangelho sem palavras", "Repetida \"até que ele venha\" — aponta para a esperança futura"]},
    {"title": "Exame", "bullets": ["\"Examine-se, pois, o homem a si mesmo\"", "Não é sobre ser perfeito, é sobre ser sincero", "Preparação do coração antes de participar"]}
  ]'::jsonb,
  '["Antes da próxima Ceia, reserve um momento de exame pessoal", "Participe lembrando, proclamando e examinando — não por hábito"]'::jsonb,
  'Aproxime-se da mesa com reverência e gratidão, lembrando o preço já pago por você.',
  true
),
(
  'esperanca-que-nao-decepciona',
  'Esperança que Não Decepciona',
  'Romanos 5:1-5',
  'esperanca',
  'NT',
  'A esperança cristã como certeza fundamentada no amor de Deus, não otimismo vago.',
  'A esperança cristã não é otimismo vago — é certeza fundamentada no amor de Deus derramado em nós.',
  'Paulo traça um caminho surpreendente: da justificação pela fé à esperança que não decepciona, passando até pelas tribulações.',
  '[
    {"title": "Paz com Deus", "bullets": ["Justificados pela fé, temos paz com Deus", "Acesso pela graça em que estamos firmados", "Base objetiva, não sentimento variável"]},
    {"title": "Glória mesmo nas tribulações", "bullets": ["\"Gloriamo-nos nas tribulações\" — não apesar delas, através delas", "Tribulação produz perseverança", "Perseverança produz caráter provado"]},
    {"title": "Esperança que não decepciona", "bullets": ["Caráter provado produz esperança", "Essa esperança não decepciona", "Porque o amor de Deus foi derramado em nós pelo Espírito"]}
  ]'::jsonb,
  '["Reconheça uma tribulação atual e peça a Deus para revelar o que ela está produzindo em você", "Fundamente sua esperança no amor de Deus, não nas circunstâncias"]'::jsonb,
  'Sua esperança tem uma base sólida — descanse nela, mesmo em meio à dificuldade.',
  true
)
on conflict (slug) do nothing;
