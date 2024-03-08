import { Service } from "typedi";

import { type Position } from "@/classes/position";
import { CircularQueue } from "@/util/circularQueue";

@Service()
export class MapService {
  playerSpawnQueue = new CircularQueue(0);
  planktonSpawnQueue = new CircularQueue(1);
  /**
   * 스폰 가능 위치 반환.
   * @date 3/7/2024 - 1:18:26 PM
   *
   * @param {number} type 0일 경우 플레이어, 1일 경우 플랑크톤.
   * @returns {Position}
   */
  getSpawnablePosition(type: number): Position {
    if (type === 0) {
      return this.playerSpawnQueue.getPosition();
    } else {
      return this.planktonSpawnQueue.getPosition();
    }
  }
}
