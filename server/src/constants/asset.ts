import { type Species } from "@/types";

export const SPECIES_ASSET: Map<number, Species> = new Map<number, Species>([
  [
    1,
    {
      speciesId: 1,
      name: "니모",
      imgUrl: "imgurl/1/1_nemo", // img경로/레벨/개체id_개체명
      width: 200,
      height: 300,
      power: 10,
      health: 100,
      evolutionSet: new Set([3, 4]),
      tierCode: 1
    }
  ],
  [
    2,
    {
      speciesId: 2,
      name: "고등어",
      imgUrl: "imgurl/1/2_mackerel",
      width: 200,
      height: 300,
      power: 10,
      health: 100,
      evolutionSet: new Set([3, 4]),
      tierCode: 1
    }
  ],
  [
    3,
    {
      speciesId: 3,
      name: "개복치",
      imgUrl: "imgurl/2/3_sunfish",
      width: 200,
      height: 300,
      power: 10,
      health: 100,
      evolutionSet: new Set([5]),
      tierCode: 2
    }
  ],
  [
    4,
    {
      speciesId: 4,
      name: "해마",
      imgUrl: "imgurl/2/4_seahorse",
      width: 200,
      height: 300,
      power: 10,
      health: 100,
      evolutionSet: new Set([6]),
      tierCode: 2
    }
  ]
]);

export const TIER_ASSET: Map<number, number> = new Map<number, number>([
  [1, 100],
  [2, 500]
]);
