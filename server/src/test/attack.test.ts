import { Area } from "../classes/area";
import { describe, test } from "@jest/globals";
import { createBuilder } from "../util/builder";
import { isAttacking } from "../util/attack";

describe("attacker check", () => {
  test("attack between A and B", () => {
    let result = false;
    let x = 0;
    let y = 0;
    while (!result) {
      const areaA: Area = createBuilder(Area).setCenterX(x++).setCenterY(y++).setWidth(10).setHeight(10).setDirection(2).build();
      const areaB: Area = createBuilder(Area).setCenterX(100).setCenterY(100).setWidth(10).setHeight(10).setDirection(0).build();
      result = isAttacking(areaA, areaB);
      expect(result).toBe(false);
    }
  });
});
