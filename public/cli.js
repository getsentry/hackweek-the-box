#!/usr/bin/env node

import { program } from "commander";
import axios from "axios";

const baseURL = "http://localhost:4321";

program
  .command("play")
  .argument("[message], message to play")
  .option("-v, --voice <voice>", "voice to use", "en_us_001")
  .option("-s, --sound <sound>", "sound to play", undefined)
  .option("-l, --light <light>", "whether to turn on the light", true)
  .action(async (message, opts) => {
    await axios.post(`${baseURL}/play`, {
      message,
      voice: opts.voice,
      sound: opts.sound,
      light: opts.light === true || opts.light === "true",
    });
  });

program.command("wednesday").action(async () => {
  await axios.get(`${baseURL}/wednesday`);
});

program
  .command("sound")
  .argument("[sound], sound to play")
  .action(async (sound) => {
    await axios.post(`${baseURL}/play`, {
      sound,
    });
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

  await axios.post(`${baseURL}/play`, {
    message: `It is lunch time! You should go to ${randomRestaurant}!`,
    voice: "en_us_006",
    light: true,
  });
});

program.parse();
