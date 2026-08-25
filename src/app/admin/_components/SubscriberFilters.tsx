import type { SubscriberListFilters } from "@/services/admin";

// Formulário GET simples, sem JS — mesma convenção do resto do app
// (nenhuma outra tela usa client-side fetch pra filtro).
export function SubscriberFilters({ filters }: { filters: SubscriberListFilters }) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-card-border bg-card p-4" method="get">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold text-muted">Status</span>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="min-h-[40px] rounded-xl border border-card-border bg-background px-2 text-foreground"
        >
          <option value="">Todos</option>
          <option value="active">Ativo</option>
          <option value="past_due">Inadimplente</option>
          <option value="cancelled">Cancelado</option>
          <option value="inactive">Inativo</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold text-muted">Método</span>
        <select
          name="method"
          defaultValue={filters.paymentMethod ?? ""}
          className="min-h-[40px] rounded-xl border border-card-border bg-background px-2 text-foreground"
        >
          <option value="">Todos</option>
          <option value="pix">Pix</option>
          <option value="credit_card">Cartão</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold text-muted">Entrou de</span>
        <input
          type="date"
          name="from"
          defaultValue={filters.entryFrom?.slice(0, 10) ?? ""}
          className="min-h-[40px] rounded-xl border border-card-border bg-background px-2 text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold text-muted">Até</span>
        <input
          type="date"
          name="to"
          defaultValue={filters.entryTo?.slice(0, 10) ?? ""}
          className="min-h-[40px] rounded-xl border border-card-border bg-background px-2 text-foreground"
        />
      </label>

      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="text-xs font-semibold text-muted">Buscar por e-mail</span>
        <input
          type="text"
          name="q"
          defaultValue={filters.search ?? ""}
          placeholder="email@exemplo.com"
          className="min-h-[40px] w-full rounded-xl border border-card-border bg-background px-2 text-foreground"
        />
      </label>

      <button
        type="submit"
        className="min-h-[40px] rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        Filtrar
      </button>
    </form>
  );
}
