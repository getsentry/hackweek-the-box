// instrument.ts — must be loaded before all other modules
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? "https://590a6494a36ab4e18be8023051453032@o4505188109189120.ingest.us.sentry.io/4511093842051072",

  sendDefaultPii: true,

  // Tracing
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Profiling
  integrations: [
    nodeProfilingIntegration(),
  ],
  profileSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  profileLifecycle: "trace",

  // Capture local variable values in stack frames
  includeLocalVariables: true,

  // Logs
  enableLogs: true,
});
