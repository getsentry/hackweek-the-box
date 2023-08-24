// @ts-expect-error no types
import { NodeSound } from "node-sound";
import { getAssetPath, getTempPath } from "./file";
import { textToSpeechIt } from "./lib/tiktok";
import { join } from "node:path";
import { PlayConfig, SoundFile } from "./types";
import shell from "shelljs";

const player = NodeSound.getDefaultPlayer();

export const SoundFileMap = {
  WOOF: "woof.mp3",
  VACUUM: "vacuum-cleaner.mp3",
  SHIP: "ship-horn.mp3",
  SIGH: "sigh-of-relief.mp3",
  NOICE: "noice.mp3",
};

export enum Voice {
  // English US
  "en_us_001" = "en_us_001", // Female
  "en_us_006" = "en_us_006", // Male 1
  "en_us_007" = "en_us_007", // Male 2
  "en_us_009" = "en_us_009", // Male 3
  "en_us_010" = "en_us_010", // Male 4

  // English UK
  "en_uk_001" = "en_uk_001", // Male 1
  "en_uk_003" = "en_uk_003", // Male 2

  // English AU
  "en_au_001" = "en_au_001", // Female
  "en_au_002" = "en_au_002", // Male

  // Singing
  "en_female_ht_f08_wonderful_world" = "en_female_ht_f08_wonderful_world",
  "en_female_ht_f08_glorious" = "en_female_ht_f08_glorious",
  "en_male_m03_lobby" = "en_male_m03_lobby",

  /// Characters
  "en_us_rocket" = "en_us_rocket",
}

export async function play(message: string, config: PlayConfig) {
  const voiceFile = await generateMp3(message, config);
  await playSound(config.sound);

  return playFile(voiceFile);
}

async function playSound(soundFile: SoundFile) {
  return playFile(getAssetPath(SoundFileMap[soundFile]));
}

async function playFile(file: string) {
  const system = process.platform;

  if (system === "darwin") {
    shell.exec(`afplay ${file}`);
  } else if (system === "linux") {
    shell.exec(`DISPLAY=:0 mpg123 ${file}`);
  }
}

async function generateMp3(soundString: string, config: PlayConfig) {
  const dir = getTempPath();
  await textToSpeechIt(`${config.voice}`, soundString, dir, dir);

  return join(dir, `audio-0.mp3`);
}

export function randomVoice(): Voice {
  const voices = Object.values(Voice).filter((v) => typeof v === "string");
  const index = Math.floor(Math.random() * voices.length);
  return voices[index] as unknown as Voice;
}

export function getCommitSound(commitType: string = "") {
  const map: Record<string, SoundFile> = {
    feat: "SHIP",
    fix: "SIGH",
    chore: "VACUUM",
    ref: "NOICE",
  };

  return map[commitType] || "WOOF";
}
