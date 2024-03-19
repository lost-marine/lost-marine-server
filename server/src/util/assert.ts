export function recordEnsure<T extends Record<string, unknown>>(param: T): T {
  const keys: Array<keyof T> = Object.keys(param) as Array<keyof T>;
  for (const key of keys) {
    if (param[key] === undefined || param[key] === null) {
      console.log("dpd?");
      throw new Error("Invalid Type");
    }
  }
  return param;
}
export function typeEnsure<T>(param: T | undefined | null, message?: string): T {
  if (param === undefined || param === null) {
    console.log("???");
    throw new Error(message ?? "Invalid Type");
  }
  return param;
}
