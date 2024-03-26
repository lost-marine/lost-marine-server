import { type Player } from "@/classes/player";
import { SPECIES_ASSET } from "@/constants/asset";
import { type lankInfo } from "@/types";
import { typeEnsure } from "@/util/assert";
import redis from "redis";

const playerKey: string = "player:";

const client = redis.createClient({
  url: "redis://127.0.0.1:6379",
  // url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: "lostmarine"
});
client.on("error", (err: any) => {
  console.log("redis client error", err);
});

async function initializeClient(): Promise<void> {
  await client.connect();
  console.info("Redis connected!");
}

initializeClient()
  .then(async () => {})
  .catch((error) => {
    console.error(error);
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
    console.error("레디스에 플레이어를 저장 중에 에러가 발생했습니다", error);
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
    console.error(error);
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
    console.error("플레이어가 정보 갱신에 실패했습니다.", error);
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
    console.error("플레이어 삭제에 실패했습니다:", error);
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
 * @param {number} point
 * @returns {Promise<void>}
 */
export async function zADDPlayer(playerId: number, point: number): Promise<void> {
  try {
    await client.ZADD("lank", [
      {
        score: point,
        value: playerId.toString()
      }
    ]);
  } catch (error) {
    console.log(error);
    console.error("Cannot add sorted set!");
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
    await client.ZREM("lank", playerId.toString());
  } catch (error) {
    console.error("Cannot remove sorted set : " + playerId);
  }
}

/**
 * 상위 10명까지의 정보를 가져와서 가공합니다.
 * @date 3/25/2024 - 11:50:01 AM
 * @author 박연서
 *
 * @export
 * @async
 * @returns {Promise<lankInfo[]>}
 */
export async function getTenRanker(): Promise<lankInfo[]> {
  let data: Array<{ score: number; value: string }> = [];
  const lankdata: lankInfo[] = [];
  try {
    data = await client.zRangeWithScores("lank", 0, 10, { REV: true });
    for (const item of data) {
      const thisPlayer: Player = typeEnsure(await getPlayer(Number(item.value)));
      const info: lankInfo = {
        playerId: thisPlayer.playerId,
        nickname: thisPlayer.nickname,
        speciesname: typeEnsure(SPECIES_ASSET.get(thisPlayer.speciesId)).name,
        point: thisPlayer.point
      };
      lankdata.push(info);
    }
  } catch (error) {
    console.log(error);
    console.error("Cannot get zRange");
  }
  return lankdata;
}
