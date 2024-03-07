import { Plankton } from '@/classes/plankton';
import RBush from 'rbush';
import { getSpawnablePosition } from '@/util/map';
import { createBuilder } from '@/util/builder';
import { Service } from 'typedi'

@Service()
export class PlanktonService {

    width: number; // 맵 전체의 너비
    height: number; // 맵 전체의 높이
    planktonCnt: number; // 전체 플랑크톤 개수
    idCounter: number;
    eatedPlanktonCnt: number; // 잡아 먹힌 플랑크톤의 개수
    
    /**
     * Creates an instance of PlanktonService.
     * @date 3/7/2024 - 1:26:17 PM
     * @author 박연서
     *
     * @constructor
     * @private
     * @param {number} width 맵 전체의 너비
     * @param {number} height 맵 전체의 높이
     * @param {number} planktonCnt 전체 플랑크톤의 개수
     */
    private constructor(width: number, height: number, planktonCnt: number){

        this.width = width;
        this.height = height;
        this.planktonCnt =  planktonCnt;
        global.planktonTree = new RBush();
        this.idCounter= 1;
        global.planktonList = new Map();
        this.eatedPlanktonCnt = 0;

    }

    /**
     * Description placeholder
     * @date 3/7/2024 - 1:49:29 PM
     * @author 박연서
     */
    initPlankton():void {

        global.planktonTree?.clear();
        global.planktonList?.clear();
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

            global.planktonList?.set(this.idCounter, plankton);
            global.planktonTree?.insert(plankton.makeTplanktonType());
            this.idCounter++;
        }

    }

    /**
     * Description placeholder
     * @date 3/7/2024 - 1:25:51 PM
     * @author 박연서
     *
     * @param {number} planktonId 잡아먹힌 플랑크톤 id
     * @returns {number} 
     */
    eatedPlankton(planktonId:number):void{

        if (global.planktonList != null && (Boolean(global.planktonList.has(planktonId)))){
            const planktonInfo:Plankton = global.planktons.get(planktonId);
            global.planktonList?.delete(planktonId);
            global.planktonTree?.remove(planktonInfo.makeTplanktonType());
            this.eatedPlanktonCnt++;
           // playerservice의 eatPlankton(playerId : number, planktonId : number) 호출
        }
    }
    
    /**
     * Description placeholder
     * @date 3/7/2024 - 1:25:38 PM
     * @author 박연서
     *
     * @returns {Plankton[]} 스폰 된 플랑크톤 배열
     */
    spawnPlankton():Plankton[]{

        const responedPlankton: Plankton[] = []

        for(let i = this.eatedPlanktonCnt; i >=0; i--){
            const position:number[] = getSpawnablePosition(2);
            const plankton:Plankton = createBuilder(Plankton)
            .setStartX(position[0])
            .setStartY(position[1])
            .setPlanktonId(this.idCounter)
            .build();

            global.planktonList?.set(this.idCounter, plankton);
            global.planktonTree?.insert(plankton.makeTplanktonType())
            this.idCounter++;
            responedPlankton.push(plankton);
        }
        return responedPlankton;
    }
    
}