let lockStatus = false;

export const lock = () => {
  lockStatus = true;
};

export const unlock = () => {
  lockStatus = false;
};

export const isLocked = () => {
  return lockStatus;
};
