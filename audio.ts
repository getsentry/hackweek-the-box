import sound from "sound-play";
import { join } from "path";

export const SoundFileMap = {
  WOOF: "woof.mp3",
};

export type SoundFile = keyof typeof SoundFileMap;

export function playSound(soundFile: SoundFile) {
  const fullPath = join(__dirname, "assets", SoundFileMap[soundFile]);
  sound.play(fullPath);
}
