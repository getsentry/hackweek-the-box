import { join } from "node:path";
import { playFile, playSound } from "./audio";
import { getTempPath } from "./file";
import { textToSpeechIt } from "./lib/tiktok";
import { lightOff, lightOn } from "./light";
import { AnnouncementConfig } from "./types";

export async function announce(config: AnnouncementConfig) {
  console.log("Announcing", config.message);

  const messageAudioFile = await generateMp3(config.message, config.voice);

  if (config.light) {
    await lightOn();
  }

  if (config.sound) {
    await playSound(config.sound);
  }
  await playFile(messageAudioFile);

  if (config.light) {
    await lightOff();
  }
}

async function generateMp3(message: string, voice: string) {
  const dir = getTempPath();
  await textToSpeechIt(voice, message, dir, dir);

  return join(dir, `audio-0.mp3`);
}
