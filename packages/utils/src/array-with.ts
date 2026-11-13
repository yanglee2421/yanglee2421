/**
 * Polyfill for `Array.prototype.with` method, which is not yet widely supported.
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with
 */
export const arrayWith = <TEl>(
  array: TEl[],
  index: number,
  element: TEl,
): TEl[] => {
  return Array.from(array, (el, idx) => {
    if (idx === index) {
      return element;
    }

    return el;
  });
};