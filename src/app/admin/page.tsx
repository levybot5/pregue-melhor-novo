import {
  getOverviewStats,
  getUsageStats,
  getChurnStats,
  getCohortRetention,
  getAtRiskSubscribers,
  getTrends,
} from "@/services/admin";
import { OverviewCards } from "./_components/OverviewCards";
import { UsageBlock } from "./_components/UsageBlock";
import { ChurnBlock } from "./_components/ChurnBlock";
import { CohortRetentionTable } from "./_components/CohortRetentionTable";
import { AtRiskList } from "./_components/AtRiskList";
import { TrendChart } from "./_components/TrendChart";

export const maxDuration = 60;

export default async function AdminOverviewPage() {
  const [overview, usage, churn, cohorts, atRisk, trends] = await Promise.all([
    getOverviewStats(),
    getUsageStats(),
    getChurnStats(),
    getCohortRetention(),
    getAtRiskSubscribers(),
    getTrends(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <OverviewCards stats={overview} />
      <TrendChart trends={trends} />
      <div className="grid gap-6 lg:grid-cols-2">
        <UsageBlock stats={usage} />
        <ChurnBlock stats={churn} />
      </div>
      <CohortRetentionTable cohorts={cohorts} />
      <AtRiskList subscribers={atRisk} />
    </div>
  );
}
