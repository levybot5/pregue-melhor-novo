// Curso "Pregação Sem Enrolação" — vídeos avulsos no YouTube (não uma
// playlist), por isso cada aula tem o próprio videoId real, extraído
// diretamente das URLs youtu.be/<id> já usadas neste projeto (nenhum
// ID inventado ou adivinhado).

export const PSE_COURSE_ID = "pregacao-sem-enrolacao" as const;

// Este curso não tem módulos de verdade (lista única de 20 aulas) —
// module_id fixo em 1 só para caber no schema de course_progress, que
// é compartilhado com o Curso Básico de Teologia. Não aparece na UI.
export const PSE_MODULE_ID = 1;

export type PseLesson = {
  lessonNumber: number; // 1-20
  title: string;
  youtubeVideoId: string;
};

const RAW_LESSONS: { title: string; videoId: string }[] = [
  { title: "Início do Curso", videoId: "NoT85GMSciE" },
  { title: "Introdução ao Curso", videoId: "wovKYZ9Ke9Q" },
  { title: "Interpretação da Bíblia", videoId: "sYzE2WM_EV4" },
  { title: "Contexto Histórico", videoId: "AB6FKRiX6_E" },
  { title: "Tábua Periódica Bíblica", videoId: "2fJhsWaMASo" },
  { title: "O Pregador do Evangelho", videoId: "tJBRxsom-hg" },
  { title: "Qualidades de um Bom Pregador", videoId: "615w3ZZIPkM" },
  { title: "Coisas que um Pregador Não Deve Fazer", videoId: "rsRyQl2Dco0" },
  { title: "Quem Deve Pregar", videoId: "m0n391DYnhA" },
  { title: "Vou Pregar, o Que Devo Fazer?", videoId: "sjugZvTrN_U" },
  { title: "Como Montar uma Pregação", videoId: "HUQbkrgVpiA" },
  { title: "Divisão Básica do Sermão", videoId: "nBV5cQLjgJc" },
  { title: "Classificação de Sermão", videoId: "a41rb9fHT8M" },
  { title: "Sermão Temático", videoId: "3bmXifzXHA8" },
  { title: "Sermão Textual", videoId: "aQoRTQd6G18" },
  { title: "Sermão Expositivo", videoId: "uly0nBMkDkM" },
  { title: "Método de Preparação de Sermão", videoId: "i63ik65Cewg" },
  { title: "Pregação na Prática", videoId: "uewJUvCmo8g" },
  { title: "Como Vencer a Timidez", videoId: "nLT1zGxkIDI" },
  { title: "Investimento Ministerial", videoId: "pXbKKrQnkFo" },
];

export const PSE_LESSONS: PseLesson[] = RAW_LESSONS.map((lesson, index) => ({
  lessonNumber: index + 1,
  title: lesson.title,
  youtubeVideoId: lesson.videoId,
}));

export const PSE_COURSE = {
  id: PSE_COURSE_ID,
  title: "Curso Pregação Sem Enrolação",
  description:
    "Aulas práticas para aprender a preparar, organizar e ministrar melhor suas mensagens.",
  totalLessons: PSE_LESSONS.length,
};

export function getPseLesson(lessonNumber: number): PseLesson | null {
  return PSE_LESSONS.find((l) => l.lessonNumber === lessonNumber) ?? null;
}

export function getPseAdjacentLessons(lessonNumber: number): {
  previous: PseLesson | null;
  next: PseLesson | null;
} {
  return {
    previous: getPseLesson(lessonNumber - 1),
    next: getPseLesson(lessonNumber + 1),
  };
}

export function getPseEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getPseWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
