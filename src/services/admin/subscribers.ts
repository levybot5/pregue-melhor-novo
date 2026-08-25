import "server-only";
import { getSupabaseServerClient } from "@/services/database/server-client";

export type SubscriberStatus = "active" | "inactive" | "past_due" | "cancelled";
export type SubscriberPaymentMethod = "pix" | "credit_card";

export type SubscriberListFilters = {
  status?: SubscriberStatus;
  paymentMethod?: SubscriberPaymentMethod;
  entryFrom?: string;
  entryTo?: string;
  search?: string;
  page?: number;
};

export type SubscriberListRow = {
  user_id: string;
  email: string;
  status: SubscriberStatus;
  payment_method: SubscriberPaymentMethod;
  entry_date: string;
  current_period_end: string | null;
  last_payment_at: string | null;
  days_as_subscriber: number;
  generation_count_current_period: number;
  total_count: number;
};

const PAGE_SIZE = 50;

export async function listSubscribers(
  filters: SubscriberListFilters,
): Promise<{ rows: SubscriberListRow[]; totalCount: number; page: number; pageSize: number }> {
  const supabase = await getSupabaseServerClient();
  const page = Math.max(1, filters.page ?? 1);

  const { data, error } = await supabase.rpc("admin_list_subscribers", {
    p_status: filters.status ?? null,
    p_payment_method: filters.paymentMethod ?? null,
    p_entry_from: filters.entryFrom ?? null,
    p_entry_to: filters.entryTo ?? null,
    p_search: filters.search ?? null,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  if (error) throw error;

  const rows = (data ?? []) as SubscriberListRow[];
  return {
    rows,
    totalCount: rows[0]?.total_count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export type PaymentHistoryEntry = {
  id: string;
  amount: number;
  status: string;
  payment_method: SubscriberPaymentMethod;
  paid_at: string | null;
  created_at: string;
};

export type SubscriberDetail = {
  user_id: string;
  email: string;
  status: SubscriberStatus;
  payment_method: SubscriberPaymentMethod | null;
  provider: string | null;
  provider_subscription_id_masked: string | null;
  entry_date: string;
  current_period_start: string | null;
  current_period_end: string | null;
  signup_date: string;
  payment_history: PaymentHistoryEntry[];
  generation_count: number;
  last_generation_at: string | null;
  saved_content_count: number;
  course_progress_summary: { lessons_completed: number; lessons_started: number };
};

export async function getSubscriberDetail(userId: string): Promise<SubscriberDetail | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_subscriber_detail", { p_user_id: userId });
  if (error) throw error;
  return (data as SubscriberDetail | null) ?? null;
}
