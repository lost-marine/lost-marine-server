import { Area } from "@/classes/area";
import { type Player } from "@/classes/player";
import { type PlayerAttackResponse } from "@/types";
import { createBuilder } from "@/util/builder";

/**
 * 플레이어 위치 정보 갱신
 * TODO: 상태값이랑 체력 정보 수정 필요
 * @date 3/7/2024 - 10:45:49 AM
 *
 * @param {Player} player
 */
export function updatePlayerInfo(item: Player, player: Player): void {
  item.direction = player.direction;
  item.centerX = player.centerX;
  item.centerY = player.centerY;
  item.isFlipX = player.isFlipX;
}
/**
 * Player를 Area로 바꿔줍니다
 * @date 3/13/2024 - 10:47:44 AM
 * @author 양소영
 *
 * @returns {area}
 */
export function playerToArea(player: Player): Area {
  const playterArea: Area = createBuilder(Area)
    .setCenterX(player.centerX)
    .setCenterY(player.centerY)
    .setWidth(player.width)
    .setHeight(player.height)
    .setDirection(player.direction)
    .build();
  return playterArea;
}

/**
 * 공격한 플레이어 정보 갱신
 * TODO: 획득 포인드 수정 필요
 * @date 3/8/2024 - 11:19:35 AM
 * @author 양소영
 */
export function updateAttackerInfo(player: Player): void {
  player.point++;
  player.playerCount++;
}

/**
 * 공격당한 플레이어 정보 갱신
 * @date 3/8/2024 - 11:19:59 AM
 * @author 양소영
 *
 * @param {Player} attacker
 */
export function updateDefenderInfo(player: Player, attacker: Player): void {
  player.health -= attacker.power;
  player.isGameOver = player.health <= 0;
}

/**
 * Player 정보를 PlayerAttackResponse에 넣어줌
 * @date 3/19/2024 - 4:15:32 PM
 * @author 양소영
 *
 * @returns {PlayerAttackResponse}
 */
export function toPlayerAttackResponse(player: Player): PlayerAttackResponse {
  const playerResponse: PlayerAttackResponse = {
    playerId: player.playerId,
    health: player.health,
    point: player.point,
    centerX: player.centerX,
    centerY: player.centerY,
    isGameOver: player.isGameOver,
    socketId: player.socketId
  };
  return playerResponse;
}