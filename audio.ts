import sound from "sound-play";
import { join } from "path";
import { sleep } from "./utils";
import {textToSpeechIt} from './tiktok';

export const SoundFileMap = {
  WOOF: "woof.mp3",
};

export type SoundFile = keyof typeof SoundFileMap;

export async function play(soundFile: SoundFile, message: string) {
  const voiceFile = await generateMp3(message);
  await playSound(soundFile);
  await sleep(1);
  await playVoice(voiceFile);
}

async function playSound(soundFile: SoundFile) {
  const fullPath = join(__dirname, "assets", SoundFileMap[soundFile]);

  sound.play(fullPath);
}

async function playVoice(voiceFile: string) {
  const fullPath = join(__dirname, "assets", voiceFile);

  sound.play(fullPath);
}

async function generateMp3(soundString: string) {
  const now = Date.now();
  await textToSpeechIt('en_us_001', soundString, `./assets/announcements/${now}`, `./assets/announcements/${now}`);
  // textToSpeechIt('en_female_ht_f08_wonderful_world', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
  // textToSpeechIt('en_female_ht_f08_glorious', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
  // textToSpeechIt('en_male_m03_lobby', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
  // textToSpeechIt('en_us_rocket', announcement, `./announcements/${now}`, `./announcements/${now}`);


  return `announcements/${now}/audio-0.mp3`;
}
