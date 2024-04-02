import type { Matched, Matcher } from "@/types";

export function matched<X>(x: X): Matched<X> {
  return {
    when: () => matched(x),
    otherwise: () => x
  };
}

export function match<X, Y>(x: X): Matcher<X, Y> {
  return {
    when: (pred, fn) => (pred ? matched(fn(x)) : match(x)),
    otherwise: (fn) => fn(x)
  };
}
