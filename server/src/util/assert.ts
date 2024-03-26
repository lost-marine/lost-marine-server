export function typeEnsure<T>(param: T | undefined | null, message?: string): T {
  if (param === undefined || param === null) {
    throw new Error(message ?? "INVALID_INPUT");
  }
  return param;
}

export function recordEnsure<T extends Record<string, unknown>>(param: T | undefined | null, message?: string): T {
  if (param === undefined || param === null) throw new Error("Invalid Type");
  const keys: Array<keyof T> = Object.keys(param) as Array<keyof T>;
  for (const key of keys) {
    if (param[key] === undefined || param[key] === null) {
      throw new Error(message ?? "INVALID_INPUT");
    }
  }
  return param;
}
