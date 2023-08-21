import sound from "sound-play";
import { join } from "path";
import { sleep } from "./utils";

export const SoundFileMap = {
  WOOF: "woof.mp3",
};

export type SoundFile = keyof typeof SoundFileMap;

export async function play(soundFile: SoundFile, message: string) {
  await playSound(soundFile);
  await sleep(1);
  await playVoice(message);
}

async function playSound(soundFile: SoundFile) {
  const fullPath = join(__dirname, "assets", SoundFileMap[soundFile]);

  sound.play(fullPath);
}

async function playVoice(soundString: string) {
  // implement me
  const mp3File = await generateMp3(soundString);
  const fullPath = join(__dirname, "assets", mp3File);

  sound.play(fullPath);
}

async function generateMp3(soundString: string) {
  // implement me
  return "mp3";
}
