import { type area } from "@/classes/area";
import { Bodies, Bounds } from "matter-js";

/**
 * 영역이 서로 겹치는지 아닌지 확인합니다.
 * @date 3/12/2024 - 3:57:27 PM
 * @author 박연서
 *
 * @param {area} area1
 * @param {area} area2
 * @returns {boolean}
 */
export function validateCanCrushArea(area1: area, area2: area): boolean {
  if (area1.direction !== -1 && area2.direction !== -1) {
    return crushCreatureAndCreature(area1, area2);
  }

  if (area1.direction !== -1 && area2.direction === -1) {
    return crushCreatureAndFlankton(area1, area2);
  }

  if (area1.direction === -1 && area2.direction === -1) {
    return crushCreatureAndFlankton(area2, area1);
  }
  return false;
}

function crushCreatureAndFlankton(area1: area, area2: area): boolean {
  const rectangleFromArea1 = Bodies.rectangle(area1.centerX, area1.centerY, area1.width, area1.height, {
    angle: (area1.direction * 45 * Math.PI) / 180
  }).bounds;
  const circleFromArea2 = Bodies.circle(area2.centerX, area2.centerY, area2.width).bounds;

  return Bounds.overlaps(rectangleFromArea1, circleFromArea2);
}

function crushCreatureAndCreature(area1: area, area2: area): boolean {
  const rectangleFromArea1 = Bodies.rectangle(area1.centerX, area1.centerY, area1.width, area1.height, {
    angle: (area1.direction * 45 * Math.PI) / 180
  }).bounds;
  const rectangleFromArea2 = Bodies.rectangle(area2.centerX, area2.centerY, area2.width, area2.height, {
    angle: (area2.direction * 45 * Math.PI) / 180
  }).bounds;

  return Bounds.overlaps(rectangleFromArea1, rectangleFromArea2);
}
