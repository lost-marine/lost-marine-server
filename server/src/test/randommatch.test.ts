import * as fn from "@/services/randombox";
import { type RandomEventResult } from "@/types";

describe("random-match-test", () => {
  test("random-match-test", async () => {
    const randomEvent: jest.SpyInstance = jest.spyOn(fn, "randomEventRes");

    const res: RandomEventResult = await fn.randomEventRes(1);

    expect(res.isSuccess).toBeTruthy();
    expect(randomEvent).toHaveBeenCalledTimes(1);
  });
});
