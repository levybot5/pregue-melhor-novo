"use client";

import { useState, useTransition } from "react";
import { updateNameAction } from "./actions";

const NAME_MAX_LENGTH = 60;

// Nome usado na saudação do cabeçalho da Home (canto superior direito,
// no desktop) — aqui é o único lugar do app onde a pessoa pode
// definir/editar esse nome. Vazio é válido: volta a mostrar o e-mail.
export function EditNameForm({ initialName }: { initialName: string | null }) {
  const [name, setName] = useState(initialName ?? "");
  const [savedName, setSavedName] = useState(initialName ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveLabel, setSaveLabel] = useState("Salvar");
  const [isSaving, startSaving] = useTransition();

  const isDirty = name.trim() !== (savedName ?? "").trim();

  function handleSave() {
    setErrorMessage(null);
    startSaving(async () => {
      const result = await updateNameAction(name);
      if (result.status === "error") {
        setErrorMessage(result.message);
        return;
      }
      setSavedName(result.name ?? "");
      setName(result.name ?? "");
      setSaveLabel("Salvo!");
      setTimeout(() => setSaveLabel("Salvar"), 2000);
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Perfil</h2>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Seu nome</span>
        <p className="text-xs text-muted">
          Aparece na saudação do topo da tela inicial (no desktop, no canto superior direito).
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Como você gostaria de ser chamado?"
          maxLength={NAME_MAX_LENGTH}
          className="min-h-[48px] rounded-2xl border border-card-border bg-card px-4 text-base text-foreground outline-none focus:border-primary"
        />
      </label>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="flex min-h-[44px] w-fit items-center justify-center rounded-2xl border border-card-border px-5 text-sm font-semibold text-foreground disabled:opacity-50"
      >
        {isSaving ? "Salvando..." : saveLabel}
      </button>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
    </section>
  );
}
