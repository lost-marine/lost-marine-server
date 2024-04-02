import { type Player } from "@/classes/player";
import { RANDOMBOX_ASSET } from "@/constants/asset";
import { updatePlayerStatusByRandomBox } from "@/feat/player";
import type { RandomEvent, RandomEventResult } from "@/types";
import { typeEnsure } from "@/util/assert";
import { match } from "@/util/match";
import { logger } from "@/util/winston";

/**
 * 랜덤 이벤트를 결정하는 함수
 * @date 4/2/2024 - 5:03:06 PM
 * @author 박연서
 *
 * @async
 * @returns {Promise<number>}
 */
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

/**
 * 결정된 랜덤 이벤트 숫자를 통해 랜덤 이벤트를 실행합니다.
 * @date 4/2/2024 - 5:03:19 PM
 * @author 박연서
 *
 * @export
 * @async
 * @param {Player} player
 * @returns {Promise<RandomEventResult>}
 */
export async function randomEventRes(player: Player): Promise<RandomEventResult> {
  const randomEventResult: RandomEventResult = {
    isSuccess: true,
    msg: "",
    event: 0,
    change: 0
  };

  const event: number = await randomEvent();
  const randomEventAsset: RandomEvent = typeEnsure(RANDOMBOX_ASSET.get(event));
  match(event)
    .when(event === 1, async () => {
      randomEventResult.msg = `최대 체력이 ${randomEventAsset.change} 증가합니다.`;
      randomEventResult.event = 1;
      randomEventResult.change = randomEventAsset.change;
      updatePlayerStatusByRandomBox(player, event, randomEventResult.change);
    })
    .when(event === 2, () => {
      randomEventResult.event = 2;
      randomEventResult.msg = `현재 체력이 ${randomEventAsset.change} 증가합니다.`;
      randomEventResult.change = randomEventAsset.change;
      updatePlayerStatusByRandomBox(player, event, randomEventResult.change);
    })
    .when(event === 3, () => {
      randomEventResult.event = 3;
      randomEventResult.msg = `공격력이 ${randomEventAsset.change} 증가합니다.`;
      randomEventResult.change = randomEventAsset.change;
      updatePlayerStatusByRandomBox(player, event, randomEventResult.change);
    })
    .when(event === 4, () => {
      randomEventResult.event = 4;
      randomEventResult.msg = `경험치가 ${randomEventAsset.change} 증가합니다.`;
      randomEventResult.change = randomEventAsset.change;
      updatePlayerStatusByRandomBox(player, event, randomEventResult.change);
    })
    .when(event === 5, () => {
      randomEventResult.event = 5;
      randomEventResult.msg = `이동속도가 ${randomEventAsset.change} 증가합니다.`;
      randomEventResult.change = randomEventAsset.change;
      updatePlayerStatusByRandomBox(player, event, 0);
    })
    .when(event === 6, () => {
      randomEventResult.event = 6;
      randomEventResult.msg = `대시 쿨타임이 ${randomEventAsset.change}초 감소합니다.`;
      randomEventResult.change = randomEventAsset.change;
      updatePlayerStatusByRandomBox(player, event, 0);
    })
    .otherwise(() => {
      randomEventResult.event = 7;
      randomEventResult.msg = "안타깝게도 꽝이 걸렸습니다.";
      updatePlayerStatusByRandomBox(player, event, 0);
    });

  return randomEventResult;
}
