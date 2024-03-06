import { Creature } from "@/classes/creature";


export class CreatureService {

   initCreature(type: number): Creature | null {

        // type을 추가해서, 맞는 인스턴스를 반환해주면 됩니다.
        switch (type) {
            case 1:
                return new Creature();
            default:
                return null;
        }
    }
}
