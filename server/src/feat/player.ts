import { Area } from "@/classes/area";
import { type Player } from "@/classes/player";
import { SPECIES_ASSET } from "@/constants/asset";
import { typeEnsure } from "@/util/assert";
import type { Species, PlayerAttackResponse, ItemInfo, PlayerStatusInfo } from "@/types";
import { createBuilder } from "@/util/builder";
import { match } from "@/util/match";

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
    totalExp: player.totalExp,
    nowExp: player.nowExp,
    centerX: player.centerX,
    centerY: player.centerY,
    isGameOver: player.isGameOver,
    socketId: player.socketId,
    power: player.power
  };
  return playerResponse;
}

/**
 * 플레이어 업데이트
 * @date 2024. 3. 22. - 오후 11:59:46
 * @author 양소영
 *
 * @export
 * @param {Player} player
 */
export function updateAttackerPlayerCount(attackPlayer: Player, gameoverPlayer: Player): Player {
  attackPlayer.playerCount++;
  attackPlayer.totalExp += 10 + Math.round(gameoverPlayer.totalExp * 0.5);
  attackPlayer.nowExp += 10 + Math.round(gameoverPlayer.totalExp * 0.5);
  attackPlayer.microplasticCount += gameoverPlayer.microplasticCount;
  return attackPlayer;
}

/**
 * 플레이어가 진화합니다.
 * @date 3/27/2024 - 2:50:24 PM
 * @author 박연서
 *
 * @export
 * @param {Player} player
 * @param {Species} targetSpecies
 */
export function evolvePlayer(player: Player, targetSpecies: Species, usedExp: number): void {
  player.speciesId = targetSpecies.speciesId;
  player.nowExp -= usedExp;
  player.power = targetSpecies.power;
  player.width = targetSpecies.width;
  player.height = targetSpecies.height;
  player.health = targetSpecies.health;
  player.maxHealth = targetSpecies.health;
}

/**
 * 플레이어 상태값을 변경
 * @date 3/28/2024 - 1:50:06 PM
 * @author 양소영
 *
 * @export
 * @param {ItemInfo} item
 * @param {Player} player
 */
export function updatePlayerStatusByItem(item: ItemInfo, player: Player): void {
  if (item.heal > 0) {
    player.health += player.health * (item.heal % 100);
    if (player.maximunHealth < player.health) player.health = player.maximunHealth;
  }

  if (item.damage > 0) {
    player.health -= item.damage;
    if (player.health <= 0) {
      player.health = 1;
    }
  }

  if (item.exp > 0) {
    player.totalExp += item.exp;
    player.nowExp += item.exp;
  }
}
/*
 * 플레이어 정보에서 필요한 부분만을 가공합니다.
 * @date 3/27/2024 - 2:55:52 PM
 * @author 박연서
 *
 * @export
 * @param {Player} player
 * @returns {PlayerStatusInfo}
 */
export function convertTPlayerStatusInfo(player: Player): PlayerStatusInfo {
  return {
    playerId: player.playerId,
    health: player.health,
    nowExp: player.nowExp,
    centerX: player.centerX,
    centerY: player.centerY,
    isGameOver: false
  };
}

/**
 * 킬로그 메세지를 만들어줌
 * @date 3/29/2024 - 12:39:32 PM
 * @author 양소영
 *
 * @export
 * @param {Player} attackPlayer
 * @param {Player} gameoverPlayer
 * @returns {string}
 */
export function getKillLog(attackPlayer: Player, gameoverPlayer: Player): string {
  const attackerPlayerSpecies: string = typeEnsure(SPECIES_ASSET.get(attackPlayer.speciesId)).name;
  const gameOverPlayerSpecies: string = typeEnsure(SPECIES_ASSET.get(gameoverPlayer.speciesId)).name;

  return `[${attackerPlayerSpecies}] ${attackPlayer.nickname}님이 [${gameOverPlayerSpecies}] ${gameoverPlayer.nickname}님을 잡아먹었습니다`;
}

export function updatePlayerStatusByRandomBox(player: Player, event: number, change: number): void {
  match(event)
    .when(event === 1, () => {
      player.maxHealth += change;
      player.health += change;
    })
    .when(event === 2, () => {
      player.health += change;
    })
    .when(event === 3, () => {
      player.power += change;
    })
    .when(event === 4, () => {
      player.nowExp += change;
      player.totalExp += change;
    });
  player.nowExp -= 10;
}
