import { type Player } from "@/classes/player";
import type { Plankton, TPlankton } from "@/classes/plankton";
import type RBush from "rbush";

type GlobalStore = {
  playerList: null | Map<number, Player>;
  planktonList: null | Map<number, Plankton>;
  planktonTree: null | RBush<TPlankton>;
  assert: (param: unknown) => asserts param;
};

const global: GlobalStore = {
  playerList: null,
  planktonList: null,
  planktonTree: null,
  assert: function (condition: unknown, message?: string): asserts condition {
    if (condition === undefined || condition === null) {
      throw new Error(message ?? "Invalid type");
    }
  }
};

export default global;
