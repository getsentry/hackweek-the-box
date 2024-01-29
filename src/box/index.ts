import * as Sentry from "@sentry/astro";
import { config } from "dotenv";
import { announce } from "./announcement.js";
import { getAnnouncementConfig } from "./config.js";
import { getNewCommits } from "./fetch.js";
import { initLight } from "./light.js";
import { getPRScopes } from "./pr.js";
import { initState, state } from "./state.js";
import type { Commit, Rule } from "./types.js";
import { parseCommit, runEvery, sleep } from "./utils.js";

config();

export const main = async () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    sampleRate: 1.0,
    release: "the-box@" + process.env.npm_package_version,
  });
  initLight();
  await initState();

  runEvery(60, checkForNewCommits);
};

export async function checkForNewCommits() {
  const tx = Sentry.startTransaction({ name: "checkForNewCommits" });
  console.log(`Checking for new commits (${new Date().toISOString()})`);
  const commits = await getNewCommits();
  const rules = await state.rules.getAll();

  for (const commit of commits) {
    await checkCommit(commit, rules);
  }
  console.log(`Finished check (${new Date().toISOString()})`);
  tx.finish();
}

async function checkCommit(commit: Commit, rules: Rule[]) {
  console.log("Checking commit", commit.message);
  // plays every commit in dev mode
  if (process.env.NODE_ENV === "development") {
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
  const scopes = await getPRScopes(commit.pr);
  const releases = commit.releases;

  const intersection = releases.filter((value) => scopes.includes(value));
  console.log("Scopes:", scopes, "∩", releases, "=", intersection);
  return intersection.length > 0;
}

async function checkIfAlreadyAnnounced(commit: Commit) {
  const previousCommits = await state.commits.getAll();
  if (previousCommits[commit.id]) {
    return true;
  }
  previousCommits[commit.id] = commit;
  await state.commits.saveAll(Object.values(previousCommits));

  return false;
}

function makeTestCommit(commit: Commit): Commit {
  // commit.message = "feat(dynamic-sampling): Add hackweek bias";
  commit.author = {
    id: "1",
    name: "Matej",
    username: "matej.minar",
    email: "matej.minar@sentry.io",
  };

  return commit;
}
