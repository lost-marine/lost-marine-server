import { type Player } from "@/classes/player";
import { getErrorMessage } from "@/message/message-handler";
import { getPlayer } from "@/repository/redis";
import type { Matched, Matcher, RandomEventResult } from "@/types";
import { typeEnsure } from "@/util/assert";
import { logger } from "@/util/winston";

function matched<X>(x: X): Matched<X> {
  return {
    on: () => matched(x),
    otherwise: () => x
  };
}

function match<X, Y>(x: X): Matcher<X, Y> {
  return {
    on: (pred, fn) => (pred(x) ? matched(fn(x)) : match(x)),
    otherwise: (fn) => fn(x)
  };
}

async function randomEvent(): Promise<number> {
  const luckOrBoom: number = Math.random();
  if (luckOrBoom > 0.9) {
    logger.info("꽝이 걸렸습니다... 아무 일도 하지 않습니다.");
    return 7;
  } else {
    logger.info("1번에서 6번 이벤트 중 무작위 이벤트를 시행합니다!");
    const number: number = Math.floor(Math.random() * 6 + 1);
    logger.info(number);
    return number;
  }
}

export async function randomEventRes(playerId: number): Promise<RandomEventResult> {
  const randomEventResult: RandomEventResult = {
    isSuccess: true,
    msg: "",
    maxHealth: 0,
    nowHealth: 0,
    power: 0,
    exp: 0,
    speed: 0,
    cooldown: 0
  };
  try {
    const player: Player = typeEnsure(await getPlayer(playerId));
    match(await randomEvent())
      .on(
        (x) => x === 1,
        () => {
          randomEventResult.msg = "최대 체력이 증가합니다.";
          randomEventResult.maxHealth = 10;
          player.maxHealth += 30;
          player.health += 30;
        }
      )
      .on(
        (x) => x === 2,
        () => {
          randomEventResult.msg = "현재 체력이 증가합니다.";
          randomEventResult.nowHealth = 10;
          player.health += 10;
        }
      )
      .on(
        (x) => x === 3,
        () => {
          randomEventResult.msg = "공격력이 증가합니다.";
          randomEventResult.power = 5;
          player.power += 5;
        }
      )
      .on(
        (x) => x === 4,
        () => {
          randomEventResult.msg = "경험치가 증가합니다.";
          randomEventResult.exp = 10;
          player.nowExp += 10;
          player.totalExp += 10;
        }
      )
      .on(
        (x) => x === 5,
        () => {
          randomEventResult.msg = "이동속도가 증가합니다.";
          randomEventResult.speed = 3;
        }
      )
      .on(
        (x) => x === 6,
        () => {
          randomEventResult.msg = "대시 쿨타임이 2초 감소합니다.";
          randomEventResult.cooldown = 2;
        }
      )
      .otherwise(() => {
        randomEventResult.msg = "안타깝게도 꽝이 걸렸습니다.";
      });
  } catch (error: unknown) {
    logger.error(error);
    randomEventResult.isSuccess = false;
    randomEventResult.msg = getErrorMessage(error);
  }

  return randomEventResult;
}
