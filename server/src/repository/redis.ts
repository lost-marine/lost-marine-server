import { type Player } from "@/classes/player";
import { SPECIES_ASSET } from "@/constants/asset";
import { type RankInfo } from "@/types";
import { typeEnsure } from "@/util/assert";
import redis from "redis";
import dotenv from "dotenv";
import { logger } from "@/util/winston";

const playerKey: string = "player:";

dotenv.config();

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: `${process.env.REDIS_PASS}`
});
client.on("error", (err: any) => {
  logger.error("redis client error : " + err);
});

async function initializeClient(): Promise<void> {
  await client.connect();
  await client.flushAll();
  logger.info("Redis connected!");
}

initializeClient()
  .then(async () => {})
  .catch((error) => {
    logger.error("client initalize error : " + error);
  });

/**
 * 플레이어 존재여부 확인
 * @date 2024. 3. 24. - 오후 8:35:14
 * @author 양소영
 *
 * @export
 * @async
 * @param {number} playerId
 * @returns {Promise<boolean>}
 */
export async function existPlayer(playerId: number): Promise<boolean> {
  let result: boolean = false;
  try {
    result = (await client.exists(playerKey + playerId)) === 1;
  } catch (error) {
    throw new Error("PLAYER_NO_EXIST_ERROR");
  }
  return result;
}

/**
 * 플레이어 정보 추가
 * @date 2024. 3. 24. - 오후 8:40:44
 * @author 양소영
 *
 * @export
 * @async
 * @param {number} playerId
 * @param {Player} player
 * @returns {Promise<void>}
 */
export async function setPlayer(playerId: number, player: Player): Promise<void> {
  try {
    // Player 객체를 JSON 문자열로 직렬화
    const playerJSON = JSON.stringify(player);

    // Redis에 JSON 문자열을 저장
    await client.set(playerKey + playerId, playerJSON);
  } catch (error) {
    logger.error("플레이어 저장시 에러 : " + error);
  }
}

/**
 * 플레이어 정보를 가져옴
 * @date 2024. 3. 24. - 오후 8:41:23
 * @author 양소영
 *
 * @export
 * @async
 * @param {number} key
 * @returns {Promise<Player | null>}
 */
export async function getPlayer(key: number): Promise<Player | null> {
  try {
    const playerData = await client.get(playerKey + key);

    if (playerData !== null) {
      const playerObject: Player = JSON.parse(playerData);
      return playerObject;
    }
    return playerData;
  } catch {
    throw new Error("PLAYER_NO_EXIST_ERROR");
  }
}

/**
 * 플레이어 리스트를 가져옴
 * @date 2024. 3. 24. - 오후 8:42:48
 * @author 양소영
 *
 * @export
 * @async
 * @returns {Promise<Player[]>}
 */
export async function getPlayerList(): Promise<Player[]> {
  try {
    const playerKeys = await client.keys(playerKey + "*");
    const playerList: Player[] = [];

    if (playerKeys !== undefined) {
      // 각 플레이어 키에 대해 값을 가져와 Map에 추가
      for (const key of playerKeys) {
        const value = await client.get(key);
        if (value !== null) {
          const playerObject: Player = JSON.parse(value);
          playerList.push(playerObject);
        } // 값이 null인 경우 빈 문자열로 설정
      }
    }

    return playerList;
  } catch (error) {
    logger.error("플레이어 리스트 에러 : " + error);
    return [];
  }
}

/**
 * 플레이어 정보 갱신
 * @date 2024. 3. 24. - 오후 9:09:26
 * @author 양소영
 *
 * @export
 * @async
 * @param {Player} player
 * @returns {Promise<boolean>}
 */
export async function updatePlayer(player: Player): Promise<boolean> {
  const result: boolean = false;
  try {
    if (await existPlayer(player.playerId)) {
      const playerJSON = JSON.stringify(player);
      await client.set(playerKey + player.playerId, playerJSON);
    }
  } catch (error) {
    logger.error("플레이어 정보 갱신 실패 : " + error);
  }
  return result;
}

/**
 * 플레이어 삭제
 * @date 2024. 3. 24. - 오후 9:11:32
 * @author 양소영
 *
 * @export
 * @async
 * @param {number} playerId
 * @returns {Promise<void>}
 */
export async function deletePlayer(playerId: number): Promise<void> {
  try {
    if (await existPlayer(playerId)) {
      await client.del(playerKey + playerId);
    }
  } catch (error) {
    logger.error("플레이어 삭제 실패 : " + error);
  }
}

/**
 * redis sorted set에 update/create
 * @date 3/25/2024 - 1:46:32 PM
 * @author 박연서
 *
 * @export
 * @async
 * @param {number} playerId
 * @param {number} totalExp
 * @returns {Promise<void>}
 */
export async function zADDPlayer(playerId: number, totalExp: number): Promise<void> {
  try {
    await client.ZADD("rank", [
      {
        score: totalExp,
        value: playerId.toString()
      }
    ]);
  } catch (error) {
    logger.error(error);
    logger.error("Cannot add Sorted Set");
  }
}

/**
 * redis sorted set에 해당 플레이어 delete
 * @date 3/25/2024 - 1:46:48 PM
 * @author 박연서
 *
 * @export
 * @async
 * @param {number} playerId
 * @returns {Promise<void>}
 */
export async function zREMPlayer(playerId: number): Promise<void> {
  try {
    await client.ZREM("rank", playerId.toString());
  } catch (error) {
    logger.error("Cannot remove sorted set : " + playerId);
  }
}

/**
 * 상위 10명까지의 정보를 가져와서 가공합니다.
 * @date 3/25/2024 - 11:50:01 AM
 * @author 박연서
 *
 * @export
 * @async
 * @returns {Promise<RankInfo[]>}
 */
export async function getTenRanker(): Promise<RankInfo[]> {
  let data: Array<{ score: number; value: string }> = [];
  const rankdata: RankInfo[] = [];
  try {
    data = await client.zRangeWithScores("rank", 0, 10, { REV: true });
    for (const item of data) {
      const thisPlayer: Player = typeEnsure(await getPlayer(Number(item.value)));
      const info: RankInfo = {
        playerId: thisPlayer.playerId,
        nickname: thisPlayer.nickname,
        speciesname: typeEnsure(SPECIES_ASSET.get(thisPlayer.speciesId)).name,
        totalExp: thisPlayer.totalExp
      };
      rankdata.push(info);
    }
  } catch (error) {
    logger.error(error);
    logger.error("Cannot get zRange");
  }
  return rankdata;
}
