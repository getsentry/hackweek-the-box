import dotenv from "dotenv";
import { getNewCommits } from "./fetch";
import { getAnnounceMessage } from "./message";
import { state, initState } from "./state";
import { play } from "./audio";
import { Commit, Rule } from "./types";
import { runEvery, sleep } from "./utils";
import { getPlayConfig } from "./config";
import { initLight, lightOff, lightOn } from "./light";
import { initSentry } from "./sentry";

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
  commit = makeTestCommit(commit);
  const config = await getPlayConfig(commit, rules);

  if (!config) {
    console.log("Ignoring commit", commit.message);
    return;
  }

  console.log("Announcing commit", commit.message);
  const message = getAnnounceMessage(commit, config.nickname);

  if (!message) {
    console.error("Could not generate a message");
    return;
  }

  console.log("Playing message", message);

  await lightOn();
  await play(message, config);
  await lightOff();

  await sleep(2000);
}

function makeTestCommit(commit: Commit): Commit {
  commit.message = "feat(dynamic-sampling): Add hackweek bias";
  commit.author = {
    id: "1",
    name: "Matej Minar",
    username: "matej.minar",
    email: "ognjen.bostjancic@sentry.io",
  };

  return commit;
}

main();
