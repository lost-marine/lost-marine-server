import { type Position } from "@/classes/position";
import { PLAYER_SPAWN_LIST, PLANKTON_SPAWN_LIST } from "../constants/spawnList";

export class CircularQueue {
  front: number;
  rear: number;
  capacity: number;
  queue: Position[];

  constructor(queueType: number) {
    this.capacity = 1000;
    this.front = 0;
    this.rear = 0;
    this.queue = [];

    this.initQueue(queueType);
  }

  isFull = (): boolean => {
    return this.front === (this.rear + 1) % this.capacity;
  };

  isEmpty = (): boolean => {
    return this.front === this.rear;
  };

  enQueue = (data: Position): void => {
    if (this.isFull()) throw new Error("큐에 데이터가 다 찼습니다.");

    this.queue[this.rear] = data;
    this.rear = this.setFrontRear(++this.rear);
  };

  deQueue = (): Position => {
    if (this.isEmpty()) throw new Error("큐에 데이터가 비어 있습니다.");
    const returnData = this.queue[this.front];
    this.front = this.setFrontRear(++this.front);
    return returnData;
  };

  getPosition = (): Position => {
    let pos: Position;
    while (true) {
      pos = this.deQueue();
      this.enQueue(pos);

      // TODO: 검증 로직
      if (pos != null) {
        break;
      }
    }

    return pos;
  };

  private readonly initQueue = (queueType: number): void => {
    if (queueType === 0) {
      for (const pos of PLAYER_SPAWN_LIST) {
        this.enQueue(pos);
      }
    } else {
      for (const pos of PLANKTON_SPAWN_LIST) {
        this.enQueue(pos);
      }
    }
  };

  private readonly setFrontRear = (value: number): number => {
    return value % this.capacity;
  };
}
