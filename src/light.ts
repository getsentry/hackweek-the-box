import { exec } from "./utils.js";
import { existsSync } from "fs";

const LIGHT_PIN = 20;
const GPIO_SCRIPT = "/home/ubuntu/hackweek-the-box/light.py";

let gpioAvailable: boolean | null = null;

function checkGpioAvailable(): boolean {
  if (gpioAvailable === null) {
    gpioAvailable = existsSync(GPIO_SCRIPT);
    if (!gpioAvailable) {
      console.log("GPIO script not found - light control disabled");
    }
  }
  return gpioAvailable;
}

export function initLight() {
  if (!checkGpioAvailable()) return;

  console.log("Initializing light beacon");
  try {
    exec(`python3 ${GPIO_SCRIPT} set ${LIGHT_PIN} op`);
    exec(`python3 ${GPIO_SCRIPT} set ${LIGHT_PIN} dh`);
    console.log("Light beacon initialized");
  } catch (e) {
    console.error(e);
    console.log("Error while initializing light pin");
  }
}

export function lightOn() {
  if (!checkGpioAvailable()) return;

  try {
    console.log("Turning light on");
    exec(`python3 ${GPIO_SCRIPT} set ${LIGHT_PIN} dl`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning on light pin");
  }
}

export function lightOff() {
  if (!checkGpioAvailable()) return;

  try {
    console.log("Turning light off");
    exec(`python3 ${GPIO_SCRIPT} set ${LIGHT_PIN} dh`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning off light pin");
  }
}
