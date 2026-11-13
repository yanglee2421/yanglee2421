/**
 * Splits an array into chunks of a specified size.
 * @param array The array to split into chunks.
 * @param size The size of each chunk.
 * @returns An array of chunks.
 */
export const arrayChunk = <TElement>(array: TElement[], size: number): TElement[][] => {
  const result: TElement[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
};
