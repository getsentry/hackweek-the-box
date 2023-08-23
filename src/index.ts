import dotenv from "dotenv";
import "cross-fetch/polyfill";
import { getNewCommits } from "./fetch";
import { getAnnounceMessage } from "./message";
import { init, state } from "./state";
import { play } from "./audio";
import { Commit, Rule } from "./types";
import { runEvery, sleep } from "./utils";
import { getPlayConfig } from "./config";
import { lightOff, lightOn } from "./light";

dotenv.config();

const main = async () => {
  await init();

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
}

async function checkCommit(commit: Commit, rules: Rule[]) {
  console.log("Checking commit", commit.message);
  const config = await getPlayConfig(commit, rules);

  if (!config) {
    return;
  }

  console.log("Announcing commit", commit.message);
  const message = getAnnounceMessage(commit, config.nickname);

  if (!message) {
    return;
  }

  console.log("Playing message", message);

  await lightOn();
  await play(message, config);
  await lightOff();

  await sleep(2000);
}

main();
