import { type Player } from "@/classes/player";
import { createClient } from "redis";
const client = createClient();

client.on("error", (err) => {
  console.log("Redis Client Error", err);
});

await client.connect();

export async function setPlayer(playerId: number, player: Player): Promise<void> {
  try {
    // Player 객체를 JSON 문자열로 직렬화
    const playerJSON = JSON.stringify(player);

    // Redis에 JSON 문자열을 저장
    await client.set("player:1", playerJSON);
  } catch (error) {
    // 에러 처리
    console.error("Error saving player to Redis:", error);
  }
}

export async function getPlayer(key: string): Promise<Player | null> {
  try {
    // Redis에서 JSON 문자열을 가져와 Player 객체로 변환
    const playerData = await client.get(key);

    if (playerData !== null) {
      const playerObject: Player = JSON.parse(playerData);
      return playerObject;
    }
    return null;
  } catch (error) {
    // 에러 처리
    console.error("Error getting player from Redis:", error);
    return null;
  }
}

export async function getPlayerMap(): Promise<Player[]> {
  const playerKeys = await client.keys("player:*");
  const playerList: Player[] = [];

  // 각 플레이어 키에 대해 값을 가져와 Map에 추가
  for (const key of playerKeys) {
    const value = await client.get(key);
    if (value !== null) {
      const playerObject: Player = JSON.parse(value);
      playerList.push(playerObject);
    } // 값이 null인 경우 빈 문자열로 설정
  }
  return playerList;
}
