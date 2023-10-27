import { exec } from "./utils.js";

const LIGHT_PIN = 20;

export async function initLight() {
  try {
    exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} op`);
    exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dh`);
    console.log("Initializing light beacon");
  } catch (e) {
    console.error(e);
    console.log("Error while initializing light pin");
  }
}

export async function lightOn() {
  try {
    console.log("Turning light on");
    exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dl`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning on light pin");
  }
}

export async function lightOff() {
  try {
    console.log("Turning light off");
    exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dh`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning off light pin");
  }
}
