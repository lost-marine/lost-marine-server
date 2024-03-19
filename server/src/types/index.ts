import { type Plankton } from "@/classes/plankton";
import { type Player } from "@/classes/player";

export type PlayerResponse = {
  myInfo: Player;
  playerList: Player[];
};

export type ValidateRespone = {
  isSuccess: boolean;
  msg: string;
};

export type PlayerCrashRequest = {
  playerAId: number;
  playerBId: number;
};

export type PlayerAttack = Pick<Player, "playerId" | "health" | "point" | "centerX" | "centerY" | "isGameOver">;
export type PlayerAttackResponse = PlayerAttack & { socketId: string };
export type plyaerGameOverResponse = Pick<Player, "playerId" | "planktonCount" | "microplasticCount" | "playerCount" | "point">;

export type GameStartData = {
  planktonList: Plankton[];
} & PlayerResponse;

export type PlanktonEatResponse = {
  isSuccess: boolean;
  player?: Player;
  msg: string;
};

export type Species = {
  speciesId: number;
  name: string;
  imgUrl: string;
  width: number;
  height: number;
  power: number;
  health: number;
  evolutionSet: Set<number>;
  tierCode: number;
};

export type Tier = {
  tierCode: number;
  requirementPoint: number;
};

export type ChatMessageSendResponse = {
  playerId: number;
  msg: string;
};

export type ChatMessageReceiveRequest = {
  speciesname: string;
  nickname: string;
  timeStamp: number;
} & ChatMessageSendResponse;

export type evolveRequest = {
  speciesId: number;
  playerId: number;
  point: number;
};
