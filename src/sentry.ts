import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    sampleRate: 1.0,
    integrations: [new ProfilingIntegration()],
  });
}
