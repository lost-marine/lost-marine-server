import { Creature } from "@/classes/creature";

export class CreatureService {
  /**
   * type을 입력받아, 맞는 creature 인스턴스를 반환하는 함수입니다.
   * @date 3/7/2024 - 1:53:44 PM
   * @author 박연서
   *
   * @param {number} type
   * @returns {(Creature | null)}
   */
  initCreature(type: number): Creature | null {
    switch (type) {
      case 1:
        return new Creature();
      default:
        return null;
    }
  }
}
