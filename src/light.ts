import { promise as gpio } from "rpi-gpio";

const LIGHT_PIN = 20;

export async function initLight() {
  await gpio.setup(LIGHT_PIN, gpio.DIR_OUT);
  console.log("init light");
}

export async function lightOn() {
  await gpio.write(LIGHT_PIN, true);
  console.log("turn on");
}

export async function lightOff() {
  await gpio.write(LIGHT_PIN, false);
  console.log("turn off");
}
