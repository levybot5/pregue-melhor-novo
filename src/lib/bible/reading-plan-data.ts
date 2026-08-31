// Data/streak helpers pra "Leitura de hoje" — sem plano fixo de
// capítulos por dia (isso saiu: forçar "Ezequiel 16, 17, 18" todo
// mundo no mesmo dia não fazia sentido). O que ficou: a sequência de
// dias seguidos (streak) e uma missão do dia que roda entre algumas
// opções pequenas, pra não ficar repetitivo.

// Mesmo cálculo de offset fixo (-3h, sem horário de verão desde 2019)
// já usado em startOfBrazilDay (src/services/billing/usage.ts) —
// copiado localmente de propósito, pra não criar acoplamento entre os
// domínios de bíblia e billing por uma função tão pequena.
const BRAZIL_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

export function startOfBrazilDay(reference: Date): Date {
  const brazilLocal = new Date(reference.getTime() - BRAZIL_UTC_OFFSET_MS);
  const startLocal = Date.UTC(
    brazilLocal.getUTCFullYear(),
    brazilLocal.getUTCMonth(),
    brazilLocal.getUTCDate(),
  );
  return new Date(startLocal + BRAZIL_UTC_OFFSET_MS);
}

export function getBrazilDayOfYear(reference: Date): number {
  const brazilLocal = new Date(reference.getTime() - BRAZIL_UTC_OFFSET_MS);
  const startOfYear = Date.UTC(brazilLocal.getUTCFullYear(), 0, 1);
  const startOfToday = Date.UTC(
    brazilLocal.getUTCFullYear(),
    brazilLocal.getUTCMonth(),
    brazilLocal.getUTCDate(),
  );
  return Math.floor((startOfToday - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
}

// Cada missão diz o que precisa acontecer HOJE pra contar como feita —
// avaliado em services/database/daily-mission.ts, que tem os números
// reais (capítulos lidos hoje, teve anotação hoje).
export type DailyMissionRequirement =
  | { type: "chapters"; count: number }
  | { type: "note" }
  | { type: "chaptersAndNote"; count: number };

export type DailyMissionDef = {
  label: string;
  requirement: DailyMissionRequirement;
};

// Roda por data-do-ano — mesma pra todo mundo no mesmo dia (dá pra
// comentar "hoje a missão é X" sem depender de quando cada um começou
// a usar o app), mas muda de um dia pro outro pra não cansar.
const DAILY_MISSIONS: DailyMissionDef[] = [
  { label: "Leia 1 capítulo hoje", requirement: { type: "chapters", count: 1 } },
  { label: "Faça 1 anotação hoje", requirement: { type: "note" } },
  { label: "Leia 2 capítulos hoje", requirement: { type: "chapters", count: 2 } },
  { label: "Leia 1 capítulo e anote algo", requirement: { type: "chaptersAndNote", count: 1 } },
  { label: "Leia 3 capítulos hoje", requirement: { type: "chapters", count: 3 } },
];

export function getTodayMission(dayOfYear: number): DailyMissionDef {
  return DAILY_MISSIONS[dayOfYear % DAILY_MISSIONS.length];
}

// Metas de sequência — começa em 7 dias; ao bater uma, a próxima já é
// a de cima da lista automaticamente. Progressão comum de apps de
// hábito: semana, duas semanas, mês, dois meses, 100 dias, semestre, ano.
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 180, 365];

export function getStreakGoal(streak: number): number {
  return STREAK_MILESTONES.find((m) => m > streak) ?? STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
}
