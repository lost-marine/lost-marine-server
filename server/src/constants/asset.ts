import { type Species } from "@/types";

export const SPECIES_ASSET: Map<number, Species> = new Map<number, Species>([
  [
    1,
    {
      speciesId: 1,
      name: "니모",
      imgUrl: "imgurl/1/1_nemo", // img경로/레벨/개체id_개체명
      width: 62,
      height: 30,
      power: 10,
      health: 100,
      evolutionSet: new Set([4, 5]),
      tierCode: 1
    }
  ],
  [
    2,
    {
      speciesId: 2,
      name: "고등어",
      imgUrl: "imgurl/1/2_mackerel",
      width: 64,
      height: 40,
      power: 10,
      health: 100,
      evolutionSet: new Set([3, 5]),
      tierCode: 1
    }
  ],
  [
    3,
    {
      speciesId: 3,
      name: "베타",
      imgUrl: "imgurl/2/1_Betta_splendens",
      width: 128,
      height: 128,
      power: 30,
      health: 110,
      evolutionSet: new Set([6, 9]), // 검자주복, 푸른바다거북
      tierCode: 2
    }
  ],
  [
    4,
    {
      speciesId: 4,
      name: "페넌트산호",
      imgUrl: "imgurl/2/3_Labidochromis_caeruleus",
      width: 128,
      height: 128,
      power: 15,
      health: 160,
      evolutionSet: new Set([6, 7]), // 개복치, 푸른바다거북
      tierCode: 2
    }
  ],
  [
    5,
    {
      speciesId: 5,
      name: "아홀로틀",
      imgUrl: "imgurl/2/4_Axolotl",
      width: 128,
      height: 128,
      power: 20,
      health: 130,
      evolutionSet: new Set([7, 8]), // 가오리, 개복치
      tierCode: 2
    }
  ],
  [
    6,
    {
      speciesId: 6,
      name: "푸른바다거북",
      imgUrl: "imgurl/3/1_GreenSeaTurtle",
      width: 192,
      height: 192,
      power: 40,
      health: 350,
      evolutionSet: new Set([11]), // 대왕고래
      tierCode: 3
    }
  ],
  [
    7,
    {
      speciesId: 7,
      name: "개복치",
      imgUrl: "imgurl/3/2_OceanSunfish",
      width: 192,
      height: 192,
      power: 60,
      health: 200,
      evolutionSet: new Set([10, 11]), // 대왕고래, 고래상어
      tierCode: 3
    }
  ],
  [
    8,
    {
      speciesId: 8,
      name: "가오리",
      imgUrl: "imgurl/3/3_Stingray",
      width: 192,
      height: 192,
      power: 50,
      health: 300,
      evolutionSet: new Set([10]), // 대왕고래
      tierCode: 3
    }
  ],
  [
    9,
    {
      speciesId: 9,
      name: "검자주복",
      imgUrl: "imgurl/3/4_puffer",
      width: 192,
      height: 192,
      power: 70,
      health: 250,
      evolutionSet: new Set([11]), // 고래상어
      tierCode: 3
    }
  ],
  [
    10,
    {
      speciesId: 10,
      name: "가리비귀상어",
      imgUrl: "imgurl/4/1_Whale_Shark",
      width: 288,
      height: 192,
      power: 90,
      health: 450,
      evolutionSet: new Set([]),
      tierCode: 4
    }
  ],
  [
    11,
    {
      speciesId: 11,
      name: "대왕고래",
      imgUrl: "imgurl/4/2_humpback_whale",
      width: 288,
      height: 192,
      power: 70,
      health: 600,
      evolutionSet: new Set([]),
      tierCode: 4
    }
  ]
]);

export const TIER_ASSET: Map<number, number> = new Map<number, number>([
  [0, 0],
  [1, 0],
  [2, 5],
  [3, 15],
  [4, 25]
]);
