import type { TodayMissionStatus } from "@/services/database";
import { getStreakGoal } from "@/lib/bible/reading-plan-data";
import { FlameIcon, CheckIcon } from "@/components/icons";

type TodayReadingCardProps = {
  status: TodayMissionStatus;
};

// Cartão "Leitura de hoje" — sem lista fixa de capítulos (isso saiu,
// forçar os mesmos capítulos pra todo mundo não fazia sentido). O que
// fica: a sequência de dias seguidos rumo à próxima meta, e uma missão
// pequena que roda entre algumas opções (ver getTodayMission em
// reading-plan-data.ts) pra não ficar repetitivo. Streak e missão são
// derivados de bible_reading_progress/bible_notes/personal_notes em
// getTodayMissionStatus, sem toque manual.
export function TodayReadingCard({ status }: TodayReadingCardProps) {
  const streakGoal = getStreakGoal(status.streak);
  const streakPercent = Math.min(100, (status.streak / streakGoal) * 100);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-card-border bg-gradient-to-br from-card to-primary-soft/40 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <FlameIcon className="h-5 w-5" />
        </span>
        <div className="flex flex-1 flex-col">
          <span className="text-xl font-bold leading-tight text-foreground">
            {status.streak} {status.streak === 1 ? "dia seguido" : "dias seguidos"}
          </span>
          <span className="text-xs text-muted">Meta: {streakGoal} dias</span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-card-active">
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${streakPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-3.5 py-3">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            status.missionDone ? "border-accent bg-accent" : "border-card-border"
          }`}
        >
          {status.missionDone && <CheckIcon className="h-3.5 w-3.5 text-white" />}
        </span>
        <span
          className={`text-sm font-medium ${status.missionDone ? "text-muted line-through" : "text-foreground"}`}
        >
          {status.missionLabel}
        </span>
      </div>
    </section>
  );
}
