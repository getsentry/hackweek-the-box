import shell from 'shelljs';

const LIGHT_PIN = 20;

export async function initLight() {
  try {
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} op`);
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dh`);
    console.log("init light");
  } catch (e) {
    console.error(e);
    console.log("error while initing light pin");
  }
}

export async function lightOn() {
  try {
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dl`);
    console.log("turn on");
  } catch (e) {
    console.error(e);
    console.log("error while turning on light pin");
  }
}

export async function lightOff() {
  try {
    shell.exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dh`);
    console.log("turn off");
  } catch (e) {
    console.error(e);
    console.log("error while turning off light pin");
  }
}
