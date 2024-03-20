import { type Player } from "@/classes/player";
import { SPECIES_ASSET, TIER_ASSET } from "@/constants/asset";
import { type Species } from "@/types";

export const evolutionHandler = {
  tierCode: 0,
  requirePoint: 0,
  rules: [
    {
      /**
       * 진화 할 개체 ID가 SPECIES_ASSET에 존재하는지 검사합니다.
       * @param targetSpeciesId
       * @param player
       * @returns
       */
      match: function (targetSpeciesId: number, player: Player): boolean {
        const targetEvolutionSpecies: Species | undefined = SPECIES_ASSET.get(targetSpeciesId);
        if (targetEvolutionSpecies !== undefined) {
          evolutionHandler.tierCode = targetEvolutionSpecies.tierCode;
        }
        return targetEvolutionSpecies !== undefined;
      },
      action: function (targetSpeciesId: number, player: Player): void {
        throw new Error("INVALID_INPUT");
      }
    },
    {
      /**
       * 진화 할 개체 ID가 player가 진화할 수 있는 ID인지 검사합니다.
       * @param targetSpeciesId
       * @param player
       * @returns
       */
      match: function (targetSpeciesId: number, player: Player): boolean {
        const evolutionSet: Set<number> | undefined = SPECIES_ASSET.get(player.speciesId)?.evolutionSet;
        if (evolutionSet !== undefined) return evolutionSet.has(targetSpeciesId);
        return false;
      },
      action: function (targetEvolutionSpeciesId: number, player: Player): void {
        throw new Error("PLAYER_FAIL_EVOLVE");
      }
    },
    {
      /**
       * 진화 할 개체의 정보가 TIER_ASSET에 존재하는지 검사합니다.
       * @param targetSpeciesId
       * @param player
       * @returns
       */
      match: function (targetSpeciesId: number, player: Player) {
        const requirementPoint: number | undefined = TIER_ASSET.get(evolutionHandler.tierCode);
        if (requirementPoint !== undefined) evolutionHandler.requirePoint = requirementPoint;
        return requirementPoint !== undefined;
      },
      action: function (targetSpeciesId: number, player: Player): void {
        throw new Error("CANNOT_FIND_TIER");
      }
    },
    {
      /**
       * player의 포인트가 진화가 가능한 포인트인지 검사합니다.
       * @param targetSpeciesId
       * @param player
       * @returns
       */
      match: function (targetSpeciesId: number, player: Player): boolean {
        return player.point >= evolutionHandler.requirePoint;
      },
      action: function (targetSpeciesId: number, player: Player): void {
        throw new Error("LACK_POINT_FOR_EVOLUTION");
      }
    }
  ]
};
