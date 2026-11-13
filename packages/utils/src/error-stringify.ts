/**
 * Converts an unknown error value into a human-readable string.
 *
 * - Error: Formats the error name, message, and stack trace.
 * - string: Returns the original string.
 * - null / undefined / primitive: Converts the value using String().
 * - object: Attempts to serialize the object as formatted JSON.
 * - Circular references or serialization failures: Falls back to String().
 *
 * @param error - The unknown error value to convert.
 * @returns A human-readable string representation of the error.
 */
export const errorStringify = (error: unknown): string => {
  if (error instanceof Error) {
    const name = error.name || "Error";
    const message = error.message || "(no message)";
    const stack = error.stack;

    return [
      `========== ${name} ==========`,
      "",
      "Message:",
      message,
      "",
      "Stack:",
      stack || "(no stack)",
      "============================",
    ].join("\n");
  }

  if (typeof error === "string") {
    return error;
  }

  if (error === null) {
    return String(error);
  }

  if (error === undefined) {
    return String(error);
  }

  if (typeof error === "object") {
    try {
      return JSON.stringify(error, null, 2) ?? String(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
};
