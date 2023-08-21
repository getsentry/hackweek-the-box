import { getNewCommits } from "./fetch";
import { getAnnounceMessage } from "./message";
import { init } from "./state";
import dotenv from "dotenv";
import { play } from "./audio";
import { Commit } from "./types";
import { runEvery, sleep } from "./utils";

dotenv.config();

const main = async () => {
  await init();

  runEvery(60, checkForNewCommits);
};

async function checkForNewCommits() {
  console.log("checking for new commits");
  const commits = await getNewCommits();

  for (const commit of commits) {
    await announceCommit(commit);
  }
}

async function announceCommit(commit: Commit) {
  const message = getAnnounceMessage(commit);

  if (!message) {
    return;
  }

  console.log("announcing", commit.message);

  await play("WOOF", message);
  await sleep(3);
}

main();
