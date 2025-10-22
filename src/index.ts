import * as Sentry from "@sentry/node";
import { config } from "dotenv";
import { announce } from "./announcement.js";
import { getAnnouncementConfig } from "./config.js";
import { getNewCommits } from "./fetch.js";
import { initLight } from "./light.js";
import { getPRScopes } from "./pr.js";
import { initState, state } from "./state.js";
import { startServer } from "./server.js";
import type { Commit, Rule } from "./types.js";
import { parseCommit, runEvery, sleep, getCurrentVersion } from "./utils.js";

config();

export const main = async () => {
  console.log("Initializing Sentry...");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    sampleRate: 1.0,
    release: "the-box@" + getCurrentVersion(),
    environment: process.env.NODE_ENV,
  });

  // Initialize light in background (non-blocking)
  setImmediate(() => initLight());

  await initState();

  // Start web server
  startServer();

  // Start commit checking in background (non-blocking)
  setImmediate(() => {
    console.log("Starting commit check background task...");
    runEvery(60, checkForNewCommits);
  });
};

export async function checkForNewCommits() {
  return Sentry.startSpan(
    { name: "checkForNewCommits", op: "function" },
    async () => {
      console.log(`Checking for new commits (${new Date().toISOString()})`);
      const commits = await getNewCommits();

      if (commits.length === 0) {
        console.log("No new commits");
        return;
      }

      const rules = await state.rules.getAll();

      for (const commit of commits) {
        await checkCommit(commit, rules);
      }
      console.log(`Finished check (${new Date().toISOString()})`);
    }
  );
}

async function checkCommit(commit: Commit, rules: Rule[]) {
  console.log("Checking commit", commit.message);
  // plays every commit in dev mode
  if (process.env.NODE_ENV === "dev") {
    commit = makeTestCommit(commit);
  }

  const parsedCommit = parseCommit(commit);
  const config = getAnnouncementConfig(parsedCommit, rules);

  if (!config) {
    console.log("Ignoring - no config", commit.message);
    return;
  }

  const hasMatchingScope = await checkReleaseScope(commit);
  if (!hasMatchingScope) {
    console.log("Ignoring - scope mismatch", commit.message);
    return;
  }

  const alreadyAnnounced = await checkIfAlreadyAnnounced(commit);
  if (alreadyAnnounced) {
    console.log("Ignoring - already announced", commit.message);
    return;
  }

  await announce(config);

  await sleep(2000);
}

async function checkReleaseScope(commit: Commit) {
  return Sentry.startSpan(
    { name: "checkReleaseScope", op: "function" },
    async (span) => {
      const scopes = await getPRScopes(commit.pr);
      const releases = commit.releases;

      span.setAttributes({ scopes, releases });

      const frontendMatch = releases.includes("frontend");
      const backendMatch = releases.includes("backend");

      if (scopes.includes("frontend") && scopes.includes("backend")) {
        return frontendMatch && backendMatch;
      }

      if (scopes.includes("frontend")) {
        return frontendMatch;
      }
      if (scopes.includes("backend")) {
        return backendMatch;
      }

      return false;
    }
  );
}

async function checkIfAlreadyAnnounced(commit: Commit) {
  return Sentry.startSpan(
    { name: "checkIfAlreadyAnnounced", op: "function" },
    async () => {
      const previousCommits = await state.commits.getAll();
      if (previousCommits[commit.id]) {
        return true;
      }
      previousCommits[commit.id] = commit;
      await state.commits.saveAll(Object.values(previousCommits));

      return false;
    }
  );
}

function makeTestCommit(commit: Commit): Commit {
  // commit.message = "feat(dynamic-sampling): Add hackweek bias";
  commit.author = {
    id: "1",
    name: "Pikachu",
    username: "pikachu",
    email: "pikachu@sentry.io",
  };

  return commit;
}

main();
