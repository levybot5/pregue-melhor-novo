import { describe, expect, it, vi, beforeEach } from "vitest";

// "server-only" só entende o bundler do Next.js (client vs. server);
// fora dele (aqui, no Vitest) sempre lançaria erro ao ser importado.
vi.mock("server-only", () => ({}));

const upsertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.fn(() => ({ upsert: upsertMock }));

vi.mock("@/services/database/admin-client", () => ({
  getSupabaseAdminClient: () => ({ from: fromMock }),
}));

const getPreapprovalMock = vi.fn();

vi.mock("./providers/mercadopago", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./providers/mercadopago")>();
  return {
    ...actual,
    getPreapproval: (id: string) => getPreapprovalMock(id),
  };
});

import { syncSubscriptionFromPreapproval } from "./subscription-sync";

beforeEach(() => {
  upsertMock.mockClear();
  fromMock.mockClear();
  getPreapprovalMock.mockReset();
  getPreapprovalMock.mockResolvedValue({
    id: "pre-1",
    external_reference: "user-123",
    status: "authorized",
    date_created: "2026-01-01T00:00:00Z",
    next_payment_date: "2026-02-01T00:00:00Z",
  });
});

describe("syncSubscriptionFromPreapproval", () => {
  it("busca o estado na MP e faz upsert por user_id, nunca por conta própria", async () => {
    await syncSubscriptionFromPreapproval("pre-1");

    expect(getPreapprovalMock).toHaveBeenCalledWith("pre-1");
    expect(fromMock).toHaveBeenCalledWith("subscriptions");
    expect(upsertMock).toHaveBeenCalledTimes(1);

    const [payload, options] = upsertMock.mock.calls[0];
    expect(payload).toMatchObject({
      user_id: "user-123",
      status: "active",
      provider: "mercadopago",
      provider_subscription_id: "pre-1",
    });
    expect(options).toEqual({ onConflict: "user_id" });
  });

  it("é idempotente: notificação repetida gera o mesmo upsert, sem duplicar", async () => {
    await syncSubscriptionFromPreapproval("pre-1");
    await syncSubscriptionFromPreapproval("pre-1");

    expect(upsertMock).toHaveBeenCalledTimes(2);
    expect(upsertMock.mock.calls[0][0]).toEqual(upsertMock.mock.calls[1][0]);
  });

  it("nunca escreve no banco se a MP não devolver external_reference", async () => {
    getPreapprovalMock.mockResolvedValueOnce({ id: "pre-2", status: "authorized" });

    await syncSubscriptionFromPreapproval("pre-2");

    expect(upsertMock).not.toHaveBeenCalled();
  });
});
