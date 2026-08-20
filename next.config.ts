import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sem SENTRY_AUTH_TOKEN, o upload de sourcemaps é pulado (build normal,
// só os stack traces no Sentry ficam minificados em vez de legíveis) —
// dá pra adicionar esse token depois sem mudar mais nada aqui.
export default withSentryConfig(nextConfig, {
  org: "pregue-melhor",
  project: "javascript-nextjs",
  silent: true,
});
