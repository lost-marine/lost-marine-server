import { type Player } from "../classes/player";

export type PlayerResponse = {
  myInfo: Player;
  playerList: Player[];
};
