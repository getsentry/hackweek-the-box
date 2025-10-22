import { exec } from "./utils.js";
import { existsSync } from "fs";

const LIGHT_PIN = 20;
const GPIO_BIN = "/home/ubuntu/raspi-gpio/raspi-gpio";

let gpioAvailable: boolean | null = null;

function checkGpioAvailable(): boolean {
  if (gpioAvailable === null) {
    gpioAvailable = existsSync(GPIO_BIN);
    if (!gpioAvailable) {
      console.log("GPIO binary not found - light control disabled");
    }
  }
  return gpioAvailable;
}

export function initLight() {
  if (!checkGpioAvailable()) return;

  console.log("Initializing light beacon");
  try {
    exec(`${GPIO_BIN} set ${LIGHT_PIN} op`);
    exec(`${GPIO_BIN} set ${LIGHT_PIN} dh`);
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
    exec(`${GPIO_BIN} set ${LIGHT_PIN} dl`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning on light pin");
  }
}

export function lightOff() {
  if (!checkGpioAvailable()) return;

  try {
    console.log("Turning light off");
    exec(`${GPIO_BIN} set ${LIGHT_PIN} dh`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning off light pin");
  }
}
