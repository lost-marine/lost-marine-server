import { type Plankton } from "@/classes/plankton";
import { type Player } from "@/classes/player";

export type NicknameRequest = {
  nickname: string;
};

export type PlayerResponse = {
  myInfo: Player;
  playerList: Player[];
};

export type ValidateRespone = {
  isSuccess: boolean;
  msg: string;
  nowExp?: number;
};

export type PlayerCrashRequest = {
  playerAId: number;
  playerBId: number;
};

export type PlayerAttack = Pick<Player, "playerId" | "health" | "totalExp" | "nowExp" | "centerX" | "centerY" | "isGameOver">;
export type PlayerAttackResponse = PlayerAttack & { socketId: string };
export type PlayerGameOver = Pick<Player, "playerId" | "planktonCount" | "microplasticCount" | "playerCount" | "totalExp"> &
  GameOverData;

export type GameOverData = {
  playerNickname: string;
  attackerNickname: string;
  attackerSpeciesId: number;
  message: string;
};

export type GameStartData = {
  planktonList: Plankton[];
} & PlayerResponse;

export type PlanktonEatResponse = {
  isSuccess: boolean;
  planktonCount: number;
  microplasticCount: number;
  playerStatusInfo?: PlayerStatusInfo;
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
  requirementExp: number;
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

export type EvolveRequest = {
  speciesId: number;
  playerId: number;
  nowExp: number;
};

export type RankInfo = {
  playerId: number;
  nickname: string;
  speciesname: string;
  totalExp: number;
};

export type ItemInfo = {
  heal: number;
  damage: number;
  exp: number;
};

export type itemRequest = {
  playerId: number;
  itemId: number;
};

export type itemSyncResponse = {
  itemId: number;
  isActive: boolean;
};

export type PlayerStatusInfo = {
  playerId: number;
  health: number;
  nowExp: number;
  centerX: number;
  centerY: number;
  isGameOver: boolean;
};

export type KillLog = {
  msg: string;
  type: string;
  timeStamp: number;
};

export type RandomEventResult = {
  isSuccess: boolean;
  msg: string;
  event?: number;
  change?: number;
  nowExp?: number;
};

export type Matched<X> = {
  when: () => Matched<X>;
  otherwise: () => X;
};

export type Matcher<X, Y> = {
  when: (pred: boolean, fn: (x: X) => Y) => Matcher<X, Y>;
  otherwise: (fn: (x: X) => Y) => Y;
};

export type RandomEvent = {
  event: number;
  change: number;
};
