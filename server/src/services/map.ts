import { Service } from "typedi";
import { type Area } from "@/classes/area";
import { CircularQueue } from "@/util/circularQueue";
import { validateCanCrushArea } from "@/util/crushValid";
import g from "@/types/global";
import { logger } from "@/util/winston";

@Service()
export class MapService {
  playerSpawnQueue = new CircularQueue(0);
  planktonSpawnQueue = new CircularQueue(1);
  /**
   * 스폰 가능 위치 반환.
   * @date 3/7/2024 - 1:18:26 PM
   * @author 전영빈
   *
   * @param {number} type 0일 경우 플레이어, 1일 경우 플랑크톤.
   * @returns {Area}
   */
  getSpawnableArea(type: number): Area {
    if (type === 0) {
      while (true) {
        const area: Area = this.playerSpawnQueue.getArea();
        if (this.validatePlayerSpawn(area)) {
          return area;
        }
      }
    } else {
      while (true) {
        const area: Area = this.planktonSpawnQueue.getArea();
        if (this.validatePlanktonSpawn(area)) {
          return area;
        }
      }
    }
  }

  /**
   * 플레이어 스폰 위치가 다른 플레이어와 충돌 가능성이 있는지 검사.
   * @date 3/15/2024 - 1:21:53 PM
   * @author 전영빈
   *
   * @returns {boolean}
   */
  validatePlayerSpawn(area: Area): boolean {
    let flag: boolean = true;
    g.playerList?.forEach((player) => {
      const existedArea: Area = player.playerToArea();
      if (validateCanCrushArea(existedArea, area)) {
        console.info("해당 위치에 플레이어 스폰 불가. 스폰 위치를 스킵합니다.");
        flag = false;
      }
    });

    return flag;
  }

  /**
   * 플랑크톤 스폰 위치에 이미 다른 플랑크톤이 존재하는지 검사.
   * @date 3/15/2024 - 1:23:08 PM
   * @author 전영빈
   *
   * @returns {boolean}
   */
  validatePlanktonSpawn(area: Area): boolean {
    const flag = g.planktonTree?.collides({
      minX: area.centerX - 3,
      minY: area.centerY - 3,
      maxX: area.centerX + 3,
      maxY: area.centerY + 3
    });

    if (typeof flag === "boolean") {
      if (flag) {
        return true;
        // console.log(area.centerX + ", " + area.centerY + ", " + "해당 위치에 플랑크톤이 스폰되면 안됩니다. 스킵.");
        // process.exit(1);
        // return false;
      } else {
        return true;
      }
    } else {
      logger.error("플랑크톤 스폰 에러");
      return false;
    }
  }
}
