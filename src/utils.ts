export const sleep = (miliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, miliseconds));

export const runEvery = (seconds: number, fn: () => void) => {
  fn();
  setInterval(fn, seconds * 1000);
};
