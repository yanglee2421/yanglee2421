/**
 * Clamps a number between a minimum and maximum value.
 * @param num The number to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped number.
 */
export const mathClamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Checks if a number is within a specified range.
 * @param num The number to check.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns `true` if the number is within the range, `false` otherwise.
 */
export const mathIsClamped = (num: number, min: number, max: number): boolean => {
  return Object.is(num, mathClamp(num, min, max));
};
