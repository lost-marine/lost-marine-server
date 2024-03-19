export function assert(condition: unknown, message?: string): asserts condition {
  if (condition === undefined || condition === null) {
    throw new Error(message ?? "Invalid type");
  }
}
