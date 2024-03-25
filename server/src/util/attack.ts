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
  const playerAArea = Bodies.rectangle(areaA.centerX, areaA.centerY, areaA.height, 1, {
    angle: (areaA.direction * 45 * Math.PI) / 180
  }).bounds;

  const playerBArea = Bodies.rectangle(areaB.centerX, areaB.centerY, areaB.height, areaB.width, {
    angle: (areaB.direction * 45 * Math.PI) / 180
  }).bounds;

  return Bounds.overlaps(playerAArea, playerBArea);
}
