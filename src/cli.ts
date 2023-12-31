#!/usr/bin/env node

import { program } from "commander";
import { announce } from "./announcement.js";
import { Sound, Voice, playSound } from "./audio.js";

program
  .command("play")
  .argument("[message], message to play")
  .option("-v, --voice <voice>", "voice to use", Voice.en_us_001)
  .option("-s, --sound <sound>", "sound to play", undefined)
  .option("-l, --light <light>", "whether to turn on the light", true)
  .action((message, opts) => {
    announce({
      message,
      voice: opts.voice,
      sound: opts.sound,
      light: opts.light === true || opts.light === "true",
    });
  });

program.command("wednesday").action(async () => {
  await announce({
    message: "Do you know what is today?",
    voice: Voice.en_us_006,
    light: true,
  });
  await announce({
    sound: Sound.WEDNESDAY,
    light: true,
  });
});

program
  .command("sound")
  .argument("[sound], sound to play")
  .action(async (sound: Sound) => {
    await playSound(sound);
  });

program.command("lunch").action(async () => {
  const slowRestaurants = [
    "Coconut Curry",
    "Da Rose",
    "Mochi Ramen",
    "Koi Asian",
  ];
  const fastRestaurants = [
    "Dean & David",
    "Bao Bar",
    "Max & Benito",
    "Noodle King",
    "Ilkim Kebap",
    "Canteen",
  ];

  const isFriday = new Date().getDay() === 5;
  const restaurants = isFriday ? slowRestaurants : fastRestaurants;

  const randomIndex = Math.floor(Math.random() * restaurants.length);
  const randomRestaurant = restaurants[randomIndex];

  await announce({
    message: `It is lunch time! You should go to ${randomRestaurant}!`,
    voice: Voice.en_us_006,
    light: true,
  });
});

program.parse();
