type Falsey = null | undefined | false | "" | 0 | 0n;

/**
 * Removes falsy values from an array and returns a new filtered array.
 *
 * The following values are removed: `null`, `undefined`, `false`, empty string (`""`),
 * numeric zero (`0`), and BigInt zero (`0n`).
 *
 * @template TItem The array item type.
 * @param list The array to compact.
 * @returns A new array with falsy values removed. The original array is not modified.
 */
export const arrayCompact = <TItem>(list: Array<TItem | Falsey>): TItem[] => {
  return list.filter(Boolean) as TItem[];
};
