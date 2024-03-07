import { Creature } from "./creature";

export class Player extends Creature {
  startX: number = 0;
  startY: number = 0;
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
  experience: number = 0;
  socketId: string = "";
  isFlipX: boolean = false;

  constructor(playerId: number, nickname: string, startX: number, startY: number, socketId: string) {
    super();
    this.playerId = playerId;
    this.nickname = nickname;
    this.startX = startX;
    this.startY = startY;
    this.socketId = socketId;
  }

  /**
   * 플레이어 위치 정보 갱신
   * 추후 상태값이랑 체력 정보 수정 필요
   * @date 3/7/2024 - 10:45:49 AM
   *
   * @param {Player} player
   */
  updatePlayerInfo(player: Player): void {
    this.direction = player.direction;
    this.startX = player.startX;
    this.startY = player.startY;
    this.isFlipX = player.isFlipX;
  }
}
