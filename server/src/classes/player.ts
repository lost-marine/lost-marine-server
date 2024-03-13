import { Creature } from "@/classes/creature";
import { createBuilder } from "@/util/builder";
import { Area } from "./area";

export class Player extends Creature {
  direction: number = 2;
  health: number = 100;
  type: number = 1;
  power: number = 1;
  status: number = 1;
  playerId: number = 0;
  nickname: string = "";
  planktonCount: number = 0;
  microplasticCount: number = 0;
  playerCount: number = 0;
  stopTime: number = 0;
  level: number = 0;
  point: number = 0;
  socketId: string = "";
  isFlipX: boolean = false;
  isGameOver: boolean = false;
  speciesId: number = 0;

  /**
   * 플레이어 위치 정보 갱신
   * TODO: 상태값이랑 체력 정보 수정 필요
   * @date 3/7/2024 - 10:45:49 AM
   *
   * @param {Player} player
   */
  updatePlayerInfo(player: Player): void {
    this.direction = player.direction;
    this.centerX = player.centerX;
    this.centerY = player.centerY;
    this.isFlipX = player.isFlipX;
  }

  /**
   * 공격한 플레이어 정보 갱신
   * TODO: 획득 포인드 수정 필요
   * @date 3/8/2024 - 11:19:35 AM
   * @author 양소영
   */
  updateAttackerInfo(): void {
    this.point++;
    this.playerCount++;
  }

  /**
   * 공격당한 플레이어 정보 갱신
   * @date 3/8/2024 - 11:19:59 AM
   * @author 양소영
   *
   * @param {Player} attacker
   */
  updateDefenderInfo(attacker: Player): void {
    this.health -= attacker.power;
    this.isGameOver = this.health <= 0;
  }

  /**
   * Player를 Area로 바꿔줍니다
   * @date 3/13/2024 - 10:47:44 AM
   * @author 양소영
   *
   * @returns {area}
   */
  playerToArea(): Area {
    const playterArea: Area = createBuilder(Area)
      .setCenterX(this.centerX)
      .setCenterY(this.centerY)
      .setWidth(this.width)
      .setHeight(this.height)
      .setDirection(this.direction)
      .build();
    return playterArea;
  }
}
