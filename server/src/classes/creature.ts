import { Area } from "./area";

export class Creature extends Area {
  width: number = 0;
  height: number = 0;
  health: number = 0;
  type: number = 0;
  power: number = 0;
  status: number = 0;
  isFlipX: boolean;
  speciesId: number;
}
