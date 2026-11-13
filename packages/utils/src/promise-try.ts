import type { CallbackFn } from "./types";

/**
 * Polyfill for `Promise.try` method, which is not yet widely supported.
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try
 */
export const promiseTry = <TArgs extends unknown[], TReturn>(
  callback: CallbackFn<TArgs, TReturn>,
  ...args: TArgs
): Promise<TReturn> => {
  return new Promise<TReturn>((resolve) => resolve(callback(...args)));
};
