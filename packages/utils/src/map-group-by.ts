import type { CallbackFn } from "./types";

/**
 * Polyfill for `Array.prototype.groupBy` method, which is not yet widely supported.
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/groupBy
 */
export const mapGroupBy = <TElement, TKey>(
  items: TElement[],
  callbackFn: CallbackFn<[TElement, number], TKey>,
): Map<TKey, TElement[]> => {
  const resultMap = new Map<TKey, TElement[]>();

  items.reduce((latestResult, item, index) => {
    const mapKey = callbackFn(item, index);
    const mapValue = latestResult.get(mapKey);

    if (Array.isArray(mapValue)) {
      mapValue.push(item);
    } else {
      latestResult.set(mapKey, [item]);
    }

    return latestResult;
  }, resultMap);

  return resultMap;
};
