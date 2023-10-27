import { join } from "node:path";
import { playFile, playSound } from "./audio.js";
import { getTempPath } from "./file.js";
import { textToSpeechIt } from "./lib/tiktok.js";
import { lightOff, lightOn } from "./light.js";
import type { AnnouncementConfig } from "./types.js";
import { isLocked, lock, unlock } from "./lock.js";

export async function announce(config: AnnouncementConfig) {
  if (isLocked()) {
    console.log("Box is locked, cannot announce");
    return;
  }
  lock();
  console.log("Announcing", config.message);

  let messageAudioFile: string | undefined;
  if (config.message && config.voice) {
    messageAudioFile = await generateMp3(config.message, config.voice);
  }

  if (config.light) {
    await lightOn();
  }

  if (config.sound) {
    await playSound(config.sound);
  }

  if (messageAudioFile) {
    await playFile(messageAudioFile);
  }

  if (config.light) {
    await lightOff();
  }
  unlock();
}

async function generateMp3(message: string, voice: string) {
  const dir = getTempPath();
  await textToSpeechIt(voice, message, dir, dir);

  return join(dir, `audio-0.mp3`);
}
