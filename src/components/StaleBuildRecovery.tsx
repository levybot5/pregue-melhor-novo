"use client";

import { useEffect } from "react";

// Depois de um deploy, uma aba que já estava aberta antes pode tentar
// navegar (clicar num <Link>) pedindo um chunk/RSC de uma build que já
// não existe mais no servidor — falha silenciosa: o clique não faz
// nada visível (foi o que aconteceu com "Já sou assinante" logo após
// alguns deploys seguidos). Em vez de deixar a pessoa achando que o
// app travou, detecta esse padrão específico de erro e recarrega a
// página inteira uma vez, o que sempre resolve (busca a build atual).
const STALE_BUILD_PATTERN =
  /chunkloaderror|loading chunk [\w.]+ failed|failed to fetch dynamically imported module|failed to fetch rsc payload/i;

const RELOAD_GUARD_KEY = "pregue-melhor-stale-build-reload";

function isStaleBuildError(message: unknown): boolean {
  return typeof message === "string" && STALE_BUILD_PATTERN.test(message);
}

function recoverOnce() {
  // Só recarrega uma vez por aba — evita loop se o erro persistir por
  // outro motivo (ex.: sem conexão de verdade).
  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  } catch {
    // sessionStorage indisponível — recarrega mesmo assim, sem guarda.
  }
  window.location.reload();
}

export function StaleBuildRecovery() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      if (isStaleBuildError(event.message)) recoverOnce();
    }
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason ?? "");
      if (isStaleBuildError(message)) recoverOnce();
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
