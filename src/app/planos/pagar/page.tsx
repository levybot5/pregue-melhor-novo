import { isPlanId, DEFAULT_PLAN_ID } from "@/services/billing/pricing";
import { PagarForm } from "./PagarForm";

export default async function PagarPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planId = isPlanId(plan) ? plan : DEFAULT_PLAN_ID;
  return <PagarForm planId={planId} />;
}
