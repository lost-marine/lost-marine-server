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
  playerId: number;
  attackedPlayerId: number;
};

export type GameStartData = {
  planktonList: Plankton[];
} & PlayerResponse;

export type PlanktonEatResponse = {
  isSuccess: boolean;
  player?: Player;
};

export type Species = {
  speciesId: number;
  name: string;
  imgUrl: string;
  width: number;
  height: number;
  power: number;
  health: number;
  evolutionList: number[];
  tierCode: number;
};

export type Tier = {
  tierCode: number;
  requirementPoint: number;
};
