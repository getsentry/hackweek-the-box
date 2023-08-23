import { promise as gpio } from "rpi-gpio";

const LIGHT_PIN = 20;

export async function initLight() {
  try {
    await gpio.setup(LIGHT_PIN, gpio.DIR_OUT);
    console.log("init light");
  } catch (e) {
    console.log("error while initing light pin");
  }
}

export async function lightOn() {
  try {
    await gpio.write(LIGHT_PIN, true);
    console.log("turn on");
  } catch (e) {
    console.log("error while turning on light pin");
  }
}

export async function lightOff() {
  try {
    await gpio.write(LIGHT_PIN, false);
    console.log("turn off");
  } catch (e) {
    console.log("error while turning off light pin");
  }
}
