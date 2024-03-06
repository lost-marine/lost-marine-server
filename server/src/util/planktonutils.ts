
import type {TPlankton, AreaInfo, Plankton } from '@/classes/plankton'

export function divideArea(width: number, height: number, widthDivide: number, heightDivide: number, planctonCnt: number):AreaInfo[]{

    const areawidth: number = width / widthDivide;
    const areaheight: number = height / heightDivide;
    const divisionArea: AreaInfo[] = [];

    for (let i = 0; i<heightDivide; i++){
        for(let j = 0; j<widthDivide; j++){

            const x: number = j*areawidth;
            const y: number = i*areaheight;
            
            const area:AreaInfo = {
                x,
                y,
                width: areawidth,
                height: areaheight,
                planktonsCnt: planctonCnt
            };

            divisionArea.push(area);
        };
    };

    return divisionArea;

}

export function makeTplanktonType(plankton:Plankton):TPlankton{
    
    const Tplankton:TPlankton ={
        minX: plankton.startX,
        minY: plankton.startY,
        maxX: plankton.startX+plankton.width,
        maxY: plankton.startY+plankton.height,
        id: plankton.planktonId,
    };

    return Tplankton;
}