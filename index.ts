import { getNewCommits } from "./fetch";
import { getAnnounceMessage } from "./message";
import { init } from "./state";
import dotenv from "dotenv";
import "cross-fetch/polyfill";
import { playSound } from "./audio";

dotenv.config();

const main = async () => {
  await init();

  const commits = await getNewCommits();
  commits.map((commit) => {
    console.log(getAnnounceMessage(commit));
  });

  playSound("WOOF");
};

main();
