#!/usr/bin/env node

import { program } from "commander";
import { announce } from "./announcement";
import { Voice } from "./audio";

program
  .command("play")
  .argument("<message>, message to play")
  .option("-v, --voice <voice>", "voice to use", Voice.en_us_001)
  .option("-s, --sound <sound>", "sound to play", undefined)
  .option("-l, --light", "whether to turn on the light", true)
  .action((message, opts) => {
    announce({
      message,
      voice: opts.voice,
      sound: opts.sound,
      light: true,
    });
  });

program
  .command("sound")
  .argument("<sound>, sound to play")
  .action((sound) => {
    console.log("sound command called", sound);
  });

program.parse();
