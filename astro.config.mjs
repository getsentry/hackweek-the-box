import { defineConfig } from "astro/config";
import nodejs from "@astrojs/node";
import sentry from "@sentry/astro";
import { main } from "./src/box";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: nodejs({
    mode: "middleware",
  }),
  vite: {
    build: {
      manifest: true,
      rollupOptions: {
        external: [".db.json"],
      },
    },
    optimizeDeps: {
      exclude: [".db.json", "./.db.json"],
    },
    assetsInclude: [".db.json", "./.db.json"],
  },
  integrations: [
    sentry({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      sampleRate: 1.0,
      sourceMapsUploadOptions: {
        project: "hackweek-the-box",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
    {
      name: "box",
      hooks: {
        "astro:server:start": () => {
          main();
        },
      },
    },
  ],
});
