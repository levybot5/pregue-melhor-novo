import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5963d123bcb48177b3beead33b09d35c@o4511944492974080.ingest.us.sentry.io/4511944496447488",
  // Amostragem baixa por padrão — captura todo erro, mas só uma fração
  // das transações de performance (evita estourar a cota gratuita à
  // toa num app pequeno).
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
