import type { Matched, Matcher } from "@/types";

/**
 * 패턴 매칭을 위한 함수. 패턴이 일치할 때 실행할 함수입니다.
 * @date 4/2/2024 - 5:04:28 PM
 * @author 박연서
 *
 * @export
 * @template X
 * @param {X} x
 * @returns {Matched<X>}
 */
export function matched<X>(x: X): Matched<X> {
  return {
    when: () => matched(x),
    otherwise: () => x
  };
}

/**
 * 패턴 조건에 맞으면 matched를 실행하고 아니면 체이닝을 통해 다음 조건으로 넘어갑니다.
 * @date 4/2/2024 - 5:04:50 PM
 * @author 박연서
 *
 * @export
 * @template X
 * @template Y
 * @param {X} x
 * @returns {Matcher<X, Y>}
 */
export function match<X, Y>(x: X): Matcher<X, Y> {
  return {
    when: (pred, fn) => (pred ? matched(fn(x)) : match(x)),
    otherwise: (fn) => fn(x)
  };
}
