import { Creature } from "@/classes/creature";

export class Plankton extends Creature{
    readonly width: number = 3;
    readonly height: number = 3;
    direction : number = 0;
    health : number = 0;
    type : number = 2;
    power : number = 0;
    status : number = 0;
    planktonId: number = 0;

    /**
     * Description placeholder
     * @date 3/7/2024 - 1:22:01 PM
     *
     * @param {Plankton} this
     * @returns {TPlankton}
     */
    makeTplanktonType(this: Plankton):TPlankton{
    
        const Tplankton:TPlankton ={
            minX: this.startX,
            minY: this.startY,
            maxX: this.startX+this.width,
            maxY: this.startY+this.height,
            id: this.planktonId,
        };
    
        return Tplankton;
    }
    
}

export type TPlankton = {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    id: number
}
