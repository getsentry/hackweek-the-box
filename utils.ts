export const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const runEvery = (seconds: number, fn: () => void) => {
  fn();
  setInterval(fn, seconds * 1000);
};
