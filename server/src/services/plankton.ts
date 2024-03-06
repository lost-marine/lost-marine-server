import {type TPlankton, Plankton } from '@/classes/plankton';
import * as util from '@/util/planktonutils'
import RBush from 'rbush';
import { getSpawnablePosition } from '@/util/map';
import { createBuilder } from '@/types/builder';
import { Service } from 'typedi'

@Service()
export class PlanktonService {


    width: number; // 맵 전체의 너비
    height: number; // 맵 전체의 높이
    planktonCnt: number; // 전체 플랑크톤 개수
    planktonTree: RBush<TPlankton>; //  맵 전체의 플랑크톤
    idCounter: number;
    planktons: Map<number, Plankton>;
    eatedPlanktonCnt: number; // 잡아 먹힌 플랑크톤의 개수

    private constructor(width: number, height: number, planktonCnt: number){
        //  맵 전체의 너비, 맵 전체의 높이, 맵 전체 플랑크톤의 개수.
        this.width = width;
        this.height = height;
        this.planktonCnt =  planktonCnt;
        this.planktonTree = new RBush();
        this.idCounter= 1;
        this.planktons = new Map();
        this.eatedPlanktonCnt = 0;
    }

    initPlankton():void {

        this.planktonTree.clear();
        this.planktons.clear();
        this.idCounter = 1;
        this.eatedPlanktonCnt = 0;

        for (let i=0; i<this.planktonCnt; i++){
            const position:number[] = getSpawnablePosition(2);
            const plankton:Plankton =
            createBuilder(Plankton)
            .setStartX(position[0])
            .setStartY(position[1])
            .setPlanktonId(this.idCounter)
            .build();

            this.planktons.set(this.idCounter, plankton);
            this.planktonTree.insert(util.makeTplanktonType(plankton));
            this.idCounter++;
        }

    }

    eatedPlankton(planktonId:number):number{
        //  해당 플랑크톤 ID가 잡아먹힙니다.
        if (planktonId in this.planktons){
            const planktonInfo:Plankton = this.planktons[planktonId];
            this.planktons.delete(planktonId);
            this.planktonTree.remove(util.makeTplanktonType(planktonInfo));
            this.eatedPlanktonCnt++;
            return this.eatedPlanktonCnt;
        }
        else {
            return this.eatedPlanktonCnt;
        }
    }
    
    spawnPlankton():{'spawnPlanktonList':Plankton[]}{

        const responedPlankton: {'spawnPlanktonList':Plankton[]}
         = {'spawnPlanktonList':[]};

        for(let i = this.eatedPlanktonCnt; i >=0; i--){
            const position:number[] = getSpawnablePosition(2);
            const plankton:Plankton = createBuilder(Plankton)
            .setStartX(position[0])
            .setStartY(position[1])
            .setPlanktonId(this.idCounter)
            .build();

            this.planktons.set(this.idCounter, plankton);
            this.planktonTree.insert(util.makeTplanktonType(plankton))
            this.idCounter++;
            responedPlankton.spawnPlanktonList.push(plankton);
        }
        return responedPlankton;
    }

    getPlanktonList():{'planktonList':Plankton[]}{
        const list = {
            'planktonList': Object.values(this.planktons)
        }
        return list;
    }
    
}