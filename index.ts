import { getNewCommits } from "./fetch";
import { getAnnounceMessage } from "./message";
import { init, wipe } from "./state";
import dotenv from "dotenv";
import "cross-fetch/polyfill";
import {textToSpeechIt} from './tiktok';

dotenv.config();

const main = async () => {
  await wipe();

  const commits = await getNewCommits();
  commits.map((commit) => {
    const announcement = getAnnounceMessage(commit);
    if (!announcement) {
      return;
    }

    const now = Date.now();
    // textToSpeechIt('en_us_001', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
    // textToSpeechIt('en_female_ht_f08_wonderful_world', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
    // textToSpeechIt('en_female_ht_f08_glorious', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
    // textToSpeechIt('en_male_m03_lobby', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
    textToSpeechIt('en_us_rocket', announcement, `./announcements/${now}`, `./announcements/${now}`);

  });
};

main();
