"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Só entra em ação se o próprio root layout quebrar (caso raro) — todo
// outro erro de página é capturado por instrumentation.ts/onRequestError.
// Precisa dos próprios <html>/<body> porque substitui o root layout
// inteiro quando ativado.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>Algo deu errado.</h1>
          <p>Recarregue a página. Já fomos avisados do problema.</p>
        </div>
      </body>
    </html>
  );
}
