import { type Area } from "@/classes/area";
import matter from "matter-js";
const { Bodies, Bounds } = matter;

/**
 * 영역이 서로 겹치는지 아닌지 확인합니다.
 * @date 3/12/2024 - 3:57:27 PM
 * @author 박연서
 *
 * @param {Area} area1
 * @param {Area} area2
 * @returns {boolean}
 */
export function validateCanCrushArea(area1: Area, area2: Area): boolean {
  if (area1.direction !== -1) {
    if (area2.direction !== -1) {
      return crushCreatureAndCreature(area1, area2);
    } else {
      return crushCreatureAndFlankton(area1, area2);
    }
  } else {
    return crushCreatureAndFlankton(area2, area1);
  }
}

/**
 * 물체와 플랑크톤이 서로 겹치는지 확인합니다.
 * @date 3/12/2024 - 5:45:37 PM
 * @author 박연서
 *
 * @param {Area} area1
 * @param {Area} area2
 * @returns {boolean}
 */
function crushCreatureAndFlankton(area1: Area, area2: Area): boolean {
  const rectangleFromArea1 = Bodies.rectangle(area1.centerX, area1.centerY, area1.width + 5, area1.height + 5, {
    angle: (area1.direction * 45 * Math.PI) / 180
  }).bounds;
  const circleFromArea2 = Bodies.circle(area2.centerX, area2.centerY, area2.width).bounds;

  return Bounds.overlaps(rectangleFromArea1, circleFromArea2);
}

/**
 * 물체와 물체가 서로 겹치는지 확인합니다.
 * @date 3/12/2024 - 5:46:52 PM
 * @author 박연서
 *
 * @param {Area} area1
 * @param {Area} area2
 * @returns {boolean}
 */
function crushCreatureAndCreature(area1: Area, area2: Area): boolean {
  const rectangleFromArea1 = Bodies.rectangle(area1.centerX, area1.centerY, area1.height + 5, area1.width + 5, {
    angle: (area1.direction * 45 * Math.PI) / 180
  }).bounds;
  const rectangleFromArea2 = Bodies.rectangle(area2.centerX, area2.centerY, area2.height + 5, area2.width + 5, {
    angle: (area2.direction * 45 * Math.PI) / 180
  }).bounds;

  return Bounds.overlaps(rectangleFromArea1, rectangleFromArea2);
}
