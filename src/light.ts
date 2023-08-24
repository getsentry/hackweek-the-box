import shell from "shelljs";

const LIGHT_PIN = 20;

export async function initLight() {
  try {
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} op`);
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dh`);
    console.log("Initializing light beacon");
  } catch (e) {
    console.error(e);
    console.log("Error while initializing light pin");
  }
}

export async function lightOn() {
  try {
    console.log("Turning light on");
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dl`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning on light pin");
  }
}

export async function lightOff() {
  try {
    console.log("Turning light off");
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dh`);
  } catch (e) {
    console.error(e);
    console.log("Error while turning off light pin");
  }
}
