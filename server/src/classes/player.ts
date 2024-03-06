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
}
