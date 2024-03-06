import { type Player } from "./../classes/player";

type GlobalStore = {
  playerList: null | Map<number, Player>;
};
const global: GlobalStore = {
  playerList: null
};

export default global;
