import { listSubscribers } from "@/services/admin";
import type { SubscriberListFilters, SubscriberPaymentMethod, SubscriberStatus } from "@/services/admin";
import { SubscriberFilters } from "../_components/SubscriberFilters";
import { SubscriberTable } from "../_components/SubscriberTable";

type SearchParams = {
  status?: string;
  method?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
};

const VALID_STATUSES: SubscriberStatus[] = ["active", "inactive", "past_due", "cancelled"];
const VALID_METHODS: SubscriberPaymentMethod[] = ["pix", "credit_card"];

function buildFilters(params: SearchParams): SubscriberListFilters {
  return {
    status: VALID_STATUSES.includes(params.status as SubscriberStatus)
      ? (params.status as SubscriberStatus)
      : undefined,
    paymentMethod: VALID_METHODS.includes(params.method as SubscriberPaymentMethod)
      ? (params.method as SubscriberPaymentMethod)
      : undefined,
    entryFrom: params.from || undefined,
    entryTo: params.to || undefined,
    search: params.q || undefined,
    page: params.page ? Math.max(1, Number(params.page) || 1) : 1,
  };
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = buildFilters(params);
  const { rows, totalCount, page, pageSize } = await listSubscribers(filters);

  function buildPageHref(targetPage: number): string {
    const query = new URLSearchParams();
    if (filters.status) query.set("status", filters.status);
    if (filters.paymentMethod) query.set("method", filters.paymentMethod);
    if (filters.entryFrom) query.set("from", filters.entryFrom);
    if (filters.entryTo) query.set("to", filters.entryTo);
    if (filters.search) query.set("q", filters.search);
    query.set("page", String(targetPage));
    return `/admin/assinantes?${query.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <SubscriberFilters filters={filters} />
      <SubscriberTable
        rows={rows}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        buildPageHref={buildPageHref}
      />
    </div>
  );
}
