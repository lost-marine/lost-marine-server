import { type Species } from "@/types";

export const SPECIES_ASSET: Map<number, Species> = new Map<number, Species>([
  [
    1,
    {
      speciesId: 1,
      name: "개복치",
      imgUrl: "img/url",
      width: 200,
      height: 300,
      power: 10,
      health: 100,
      evolutionList: new Set([2, 3]),
      tierCode: 1
    }
  ]
]);

export const TIER_ASSET: Map<number, number> = new Map<number, number>([[1, 100]]);
