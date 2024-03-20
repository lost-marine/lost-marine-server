import { type Player } from "@/classes/player";
import type { Plankton, TPlankton } from "@/classes/plankton";
import RBush from "rbush";

type GlobalStore = {
  playerList: Map<number, Player>;
  planktonList: Map<number, Plankton>;
  planktonTree: RBush<TPlankton>;
};

const g: GlobalStore = {
  playerList: new Map(),
  planktonList: new Map(),
  planktonTree: new RBush()
};

export default g;
