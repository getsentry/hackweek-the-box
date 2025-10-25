import { exec } from "./utils.js";
import { getAssetPath } from "./file.js";
import type { CommitType } from "./types.js";
import { existsSync } from "fs";

export enum Sound {
  WOOF = "WOOF",
  VACUUM = "VACUUM",
  SHIP = "SHIP",
  SIGH = "SIGH",
  NOICE = "NOICE",
  TESTING = "TESTING",
  REWIND = "REWIND",
  RICCARDO = "RICCARDO",
  WEDNESDAY = "WEDNESDAY",
  AH_SHIT = "AH_SHIT",
  DAMN_TRAIN = "DAMN_TRAIN",
  DRUM_ROLL = "DRUM_ROLL",
  SKILL_ISSUE = "SKILL_ISSUE",
  FAKE_NEWS = "FAKE_NEWS",
}

export const SoundFileMap: Record<Sound, string> = {
  WOOF: "woof.mp3",
  VACUUM: "vacuum-cleaner.mp3",
  SHIP: "ship-horn.mp3",
  SIGH: "sigh-of-relief.mp3",
  NOICE: "noice.mp3",
  TESTING: "testing.mp3",
  REWIND: "rewind.mp3",
  RICCARDO: "riccardo.mp3",
  WEDNESDAY: "wednesday.mp3",
  AH_SHIT: "ah-shit.mp3",
  DAMN_TRAIN: "damn-train.mp3",
  DRUM_ROLL: "drum-roll.mp3",
  SKILL_ISSUE: "skill-issue.mp3",
  FAKE_NEWS: "fake-news.mp3",
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

export async function playSound(sound: Sound) {
  console.log("Playing sound", sound);
  return playFile(getAssetPath(SoundFileMap[sound]));
}

export async function playFile(file: string) {
  // Check if file exists
  if (!existsSync(file)) {
    console.error(`Audio file not found: ${file}`);
    return;
  }

  const system = process.platform;

  try {
    if (system === "darwin") {
      exec(`afplay "${file}"`);
    } else if (system === "linux") {
      exec(`DISPLAY=:0 mpg123 "${file}"`);
    } else {
      console.error(`Unsupported platform: ${system}`);
    }
  } catch (error) {
    console.error(`Error playing audio file ${file}:`, error);
  }
}

export function randomVoice(): Voice {
  const voices = Object.values(Voice).filter((v) => typeof v === "string");
  const index = Math.floor(Math.random() * voices.length);
  return voices[index] as unknown as Voice;
}

export function getCommitSound(commitType: CommitType) {
  const map: Record<CommitType, Sound> = {
    feat: Sound.SHIP,
    fix: Sound.SIGH,
    chore: Sound.VACUUM,
    ref: Sound.NOICE,
    test: Sound.TESTING,
    revert: Sound.REWIND,
    unknown: Sound.WOOF,
  };

  return map[commitType];
}
