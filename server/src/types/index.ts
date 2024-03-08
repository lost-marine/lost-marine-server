import { type Plankton } from "@/classes/plankton";
import { type Player } from "@/classes/player";

export type PlayerResponse = {
  myInfo: Player;
  playerList: Player[];
};

export type EnterValidateRespone = {
  isSuccess: boolean;
  msg: string;
};

export type GameStartData = {
  planktonList: Plankton[];
} & PlayerResponse;

export type PlanktonEatResponse = {
  isSuccess: boolean;
  player?: Player;
};
