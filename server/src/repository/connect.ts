import { type Player } from "@/classes/player";
import redis from "redis";

const playerKey: string = "player:";

const client = redis.createClient({
  url: "redis://127.0.0.1:6379"
  // url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  // password: "lostmarine"
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

export async function existPlayer(playerId: number): Promise<boolean> {
  let result: boolean = false;
  try {
    result = (await client.exists(playerKey + playerId)) === 1;
  } catch (error) {
    console.error("플레이어가 존재하지 않습니다.");
  }
  return result;
}

export async function setPlayer(playerId: number, player: Player): Promise<void> {
  try {
    // Player 객체를 JSON 문자열로 직렬화
    const playerJSON = JSON.stringify(player);

    // Redis에 JSON 문자열을 저장
    await client.set(playerKey + playerId, playerJSON);
  } catch (error) {
    // 에러 처리
    console.error("Error saving player to Redis:", error);
  }
}

export async function getPlayer(key: number): Promise<Player | null> {
  try {
    // Redis에서 JSON 문자열을 가져와 Player 객체로 변환
    const playerData = await client.get(playerKey + key);

    if (playerData !== null) {
      const playerObject: Player = JSON.parse(playerData);
      return playerObject;
    }
    return playerData;
  } catch (error) {
    throw new Error("CANNOT_FIND_PLAYER");
    // 에러 처리
  }
}

export async function getPlayerList(): Promise<Player[]> {
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
}

export async function updatePlayer(player: Player): Promise<boolean> {
  const result: boolean = false;
  try {
    const playerJSON = JSON.stringify(player);
    await client.set(playerKey + player.playerId, playerJSON);
  } catch (error) {
    console.error("플레이어가 정보 갱신에 실패했습니다.");
  }
  return result;
}

export async function deletePlayer(playerId: number): Promise<void> {
  try {
    await client.del(playerKey + playerId);
  } catch (error) {
    // 에러 처리
    console.error("Error deleting player to Redis:", error);
  }
}