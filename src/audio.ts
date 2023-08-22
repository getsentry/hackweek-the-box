// @ts-expect-error no types
import { NodeSound } from "node-sound";
import { getAssetPath, getTempPath } from "./file";
import { textToSpeechIt } from "./lib/tiktok";
import { sleep } from "./utils";
import { join } from "node:path";
import { PlayConfig, SoundFile } from "./types";

const player = NodeSound.getDefaultPlayer();

export const SoundFileMap = {
  WOOF: "woof.mp3",
};

export enum Voice {
  // English US
  "en_us_001", // Female
  "en_us_006", // Male 1
  "en_us_007", // Male 2
  "en_us_009", // Male 3
  "en_us_010", // Male 4

  // English UK
  "en_uk_001", // Male 1
  "en_uk_003", // Male 2

  // English AU
  "en_au_001", // Female
  "en_au_002", // Male

  // Singing
  "en_female_ht_f08_wonderful_world",
  "en_female_ht_f08_glorious",
  "en_male_m03_lobby",

  // Characters
  "en_us_rocket",
}

export async function play(message: string, config: PlayConfig) {
  const voiceFile = await generateMp3(message, config);
  await playSound(config.sound);
  await sleep(250);

  return playFile(voiceFile);
}

async function playSound(soundFile: SoundFile) {
  return playFile(getAssetPath(SoundFileMap[soundFile]));
}

async function playFile(file: string) {
  return player.play(file);
}

async function generateMp3(soundString: string, config: PlayConfig) {
  const dir = getTempPath();
  await textToSpeechIt(`${config.voice}`, soundString, dir, dir);

  // textToSpeechIt('en_female_ht_f08_wonderful_world', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
  // textToSpeechIt('en_female_ht_f08_glorious', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
  // textToSpeechIt('en_male_m03_lobby', announceMessage, `./announcements/${now}`, `./announcements/${now}`);
  // textToSpeechIt('en_us_rocket', announcement, `./announcements/${now}`, `./announcements/${now}`);

  return join(dir, `audio-0.mp3`);
}

export function randomVoice(): Voice {
  const voices = Object.values(Voice);
  return voices[Math.floor(Math.random() * (voices.length / 2 + 1))] as Voice;
}

export function randomSound() {
  const sounds = Object.keys(SoundFileMap);
  return sounds[Math.floor(Math.random() * sounds.length)] as SoundFile;
}
