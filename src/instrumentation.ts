import type { Instrumentation } from "next";

const SENTRY_DSN =
  "https://5963d123bcb48177b3beead33b09d35c@o4511944492974080.ingest.us.sentry.io/4511944496447488";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 });
  }
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
