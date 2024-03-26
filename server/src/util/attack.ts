import { type Area } from "../classes/area";
import matter from "matter-js";
const { Bodies, Bounds } = matter;
/**
 * A가 B를 공격하고 있는지를 검증함
 * @date 3/14/2024 - 11:00:44 AM
 * @author 양소영
 *
 * @export
 * @param {Area} areaA
 * @param {Area} areaB
 * @returns {boolean}
 */
export function isAttacking(areaA: Area, areaB: Area): boolean {
  let centerX = areaA.centerX;
  let centerY = areaA.centerY;
  const direction = areaA.direction;
  const diagonalLength = areaA.width / 2;
  const halfDiagonalLength = diagonalLength / Math.sqrt(2);

  switch (direction) {
    case 0:
      centerY -= areaA.height / 2;
      break;
    case 1:
      centerX += halfDiagonalLength;
      centerY -= halfDiagonalLength;
      break;
    case 2:
      centerX += areaA.width / 2;
      break;
    case 3:
      centerX += halfDiagonalLength;
      centerY += halfDiagonalLength;
      break;
    case 4:
      centerY += areaA.height / 2;
      break;
    case 5:
      centerX -= halfDiagonalLength;
      centerY += halfDiagonalLength;
      break;
    case 6:
      centerX -= areaA.width / 2;
      break;
    case 7:
      centerX -= halfDiagonalLength;
      centerY -= halfDiagonalLength;
      break;
  }

  const playerAArea = Bodies.rectangle(centerX, centerY, 10, 10, {
    angle: (areaA.direction * 45 * Math.PI) / 180
  }).bounds;

  const playerBArea = Bodies.rectangle(areaB.centerX, areaB.centerY, areaB.height, areaB.width, {
    angle: (areaB.direction * 45 * Math.PI) / 180
  }).bounds;

  return Bounds.overlaps(playerAArea, playerBArea);
}
