import dotenv from "dotenv";
import { getNewCommits } from "./fetch";
import { getAnnounceMessage } from "./message";
import { state, initState } from "./state";
import { Commit, Rule } from "./types";
import { parseCommit, runEvery, sleep } from "./utils";
import { getAnnouncementConfig } from "./config";
import { initLight } from "./light";
import { initSentry } from "./sentry";
import { announce } from "./announcement";

dotenv.config();

const main = async () => {
  initSentry();
  initLight();
  await initState();

  runEvery(60, checkForNewCommits);
};

export async function checkForNewCommits() {
  console.log(`Checking for new commits (${new Date().toISOString()})`);
  const commits = await getNewCommits();
  const rules = await state.rules.getAll();
  console.log("Found", commits.length, "new commits");

  for (const commit of commits) {
    await checkCommit(commit, rules);
  }
  console.log(`Finished check (${new Date().toISOString()})`);
}

async function checkCommit(commit: Commit, rules: Rule[]) {
  // plays every commit in dev mode
  if (process.env.NODE_ENV === "dev") {
    commit = makeTestCommit(commit);
  }

  const parsedCommit = parseCommit(commit);
  const config = await getAnnouncementConfig(parsedCommit, rules);

  if (!config) {
    console.log("Ignoring commit", commit.message);
    return;
  }

  await announce(config);

  await sleep(2000);
}

function makeTestCommit(commit: Commit): Commit {
  commit.message = "feat(dynamic-sampling): Add hackweek bias";
  commit.author = {
    id: "1",
    name: "Matej",
    username: "matej.minar",
    email: "matej.minar@sentry.io",
  };

  return commit;
}

main();
