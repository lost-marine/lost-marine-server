import { type area } from "@/classes/area";
import { Position } from "@/classes/position";
import { Polygon, Vector, Circle, testPolygonPolygon, testPolygonCircle, testCirclePolygon } from "sat";
import { vec2 } from "gl-matrix";

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
  const area1Convert: Polygon | Circle = convertPoligon(area1);
  const area2Convert: Polygon | Circle = convertPoligon(area2);

  // 둘 다 사각형 영역을 가지는 경우
  if (isPolygon(area1Convert) && isPolygon(area2Convert)) {
    return testPolygonPolygon(area1Convert, area2Convert);
  }

  // area2가 플랑크톤인 경우
  if (isPolygon(area1Convert) && !isPolygon(area2Convert)) {
    return testPolygonCircle(area1Convert, area2Convert);
  }

  // area1가 플랑크톤인 경우
  if (!isPolygon(area1Convert) && isPolygon(area2Convert)) {
    return testCirclePolygon(area1Convert, area2Convert);
  }

  return false;
}

/**
 * area를 플랑크톤은 Circle로, 나머지는 Polygon으로 변환합니다.
 * @date 3/12/2024 - 3:57:53 PM
 * @author 박연서
 *
 * @param {area} area
 * @returns {(Polygon | Circle)}
 */
function convertPoligon(area: area): Polygon | Circle {
  if (area.direction === -1) {
    return new Circle(new Vector(area.centerX, area.centerY), area.width);
  }
  return new Polygon(
    new Vector(),
    getAreaVertex(area).map((p) => new Vector(p.x, p.y))
  );
}

/**
 * 사각형 영역인 경우, 회전 방향을 고려하여 영역의 꼭짓점을 반환합니다.
 * @date 3/12/2024 - 3:58:39 PM
 * @author 박연서
 *
 * @param {area} area
 * @returns {Position[]}
 */
function getAreaVertex(area: area): Position[] {
  const halfWidth: number = Math.ceil(area.width / 2) + 5;
  const halfHeight: number = Math.ceil(area.height / 2) + 5;

  // 회전을 고려하지 않은 사각형 꼭짓점 배열
  const vertex: Position[] = [
    new Position(area.centerX + halfWidth, area.centerY + halfHeight),
    new Position(area.centerX - halfWidth, area.centerY + halfHeight),
    new Position(area.centerX - halfWidth, area.centerY - halfHeight),
    new Position(area.centerX + halfWidth, area.centerY - halfHeight)
  ];

  // gl-matrix를 이용해 각 좌표를 회전시킵니다.
  const rotatedVertex: Position[] = vertex.map((p) => {
    const originalVector: vec2 = vec2.fromValues(p.x, p.y);
    const angle: number = (45 * area.direction * Math.PI) / 180;
    const rotatedVector: vec2 = vec2.create();
    vec2.rotate(rotatedVector, originalVector, [area.centerX, area.centerY], angle);
    return new Position(Math.floor(rotatedVector[0]), Math.floor(rotatedVector[1]));
  });

  return rotatedVertex;
}

/**
 * Polygon type인지 Circle type인지 판단하기 위한 typeguard 함수입니다.
 * @date 3/12/2024 - 4:19:30 PM
 * @author 박연서
 *
 * @param {(Polygon | Circle)} shape
 * @returns {shape is Polygon}
 */
function isPolygon(shape: Polygon | Circle): shape is Polygon {
  return shape instanceof Polygon;
}
