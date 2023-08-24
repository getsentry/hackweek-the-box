export const sleep = (miliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, miliseconds));

export const runEvery = (seconds: number, fn: () => void) => {
  const wrappedFn = async () => {
    await fn();
    setTimeout(wrappedFn, seconds * 1000);
  };

  wrappedFn();
};


