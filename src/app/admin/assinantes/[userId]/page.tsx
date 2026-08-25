import { notFound } from "next/navigation";
import { getSubscriberDetail } from "@/services/admin";
import { SubscriberDetailCard } from "../../_components/SubscriberDetailCard";
import { PaymentHistoryTable } from "../../_components/PaymentHistoryTable";
import { UsageAndContentSummary } from "../../_components/UsageAndContentSummary";

export default async function AdminSubscriberDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const detail = await getSubscriberDetail(userId);

  if (!detail) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <SubscriberDetailCard detail={detail} />
      <UsageAndContentSummary detail={detail} />
      <PaymentHistoryTable history={detail.payment_history} />
    </div>
  );
}
