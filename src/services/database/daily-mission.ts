import "server-only";
import { getSupabaseServerClient } from "./server-client";
import { getBrazilDayOfYear, startOfBrazilDay, getTodayMission } from "@/lib/bible/reading-plan-data";
import { getReadingStreak } from "./bible";

export type TodayMissionStatus = {
  streak: number;
  missionLabel: string;
  missionDone: boolean;
};

export async function getTodayMissionStatus(userId: string): Promise<TodayMissionStatus> {
  const now = new Date();
  const dayOfYear = getBrazilDayOfYear(now);
  const todayStart = startOfBrazilDay(now).toISOString();
  const mission = getTodayMission(dayOfYear);

  const supabase = await getSupabaseServerClient();
  const [chaptersResult, verseNotesResult, personalNotesResult, streak] = await Promise.all([
    supabase
      .from("bible_reading_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("last_read_at", todayStart),
    supabase
      .from("bible_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("updated_at", todayStart),
    supabase
      .from("personal_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("updated_at", todayStart),
    getReadingStreak(userId),
  ]);

  if (chaptersResult.error) throw chaptersResult.error;
  if (verseNotesResult.error) throw verseNotesResult.error;
  if (personalNotesResult.error) throw personalNotesResult.error;

  const chaptersReadToday = chaptersResult.count ?? 0;
  const notedToday = (verseNotesResult.count ?? 0) > 0 || (personalNotesResult.count ?? 0) > 0;

  const missionDone =
    mission.requirement.type === "chapters"
      ? chaptersReadToday >= mission.requirement.count
      : mission.requirement.type === "note"
        ? notedToday
        : chaptersReadToday >= mission.requirement.count && notedToday;

  return { streak, missionLabel: mission.label, missionDone };
}
