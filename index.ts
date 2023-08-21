import { getNewCommits } from "./fetch";
import { getAnnounceMessage } from "./message";
import { init, wipe } from "./state";
import dotenv from "dotenv";
import "cross-fetch/polyfill";

dotenv.config();

const main = async () => {
  await wipe();

  const commits = await getNewCommits();
  commits.map((commit) => {
    console.log(getAnnounceMessage(commit));
  });
};

main();
