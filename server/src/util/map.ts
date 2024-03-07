export function getSpawnablePosition(type : number):number[]{

    const minX:number = 0+3;
    const maxX:number = 2688-3;
    const minY:number = 0+3;
    const maxY:number = 1536-3;

    return [Math.floor(Math.random()*(maxX-minX))+minX, Math.floor(Math.random()*(maxY-minY))+minY];
}