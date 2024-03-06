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
    
}

export type TPlankton = {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    id: number
}

export type AreaInfo = {
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
    planktonsCnt: number
}