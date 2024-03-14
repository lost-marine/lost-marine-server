// 공격자의 direction 값이 victim의 경계선과 맞닿아 있는지를 확인하는 함수
import { type Area } from "@/classes/area";
import Matter from "matter-js";

export function isAttacking(areaA: Area, areaB: Area): boolean {
  const attacker: Matter.Body = Matter.Bodies.rectangle(areaA.centerX, areaA.centerY, areaA.width, areaA.height);
  const victim: Matter.Body = Matter.Bodies.rectangle(areaB.centerX, areaB.centerY, areaB.width, areaB.height);

  const attackDirection = areaA.direction;
  const attackerVertices = attacker.vertices;
  const victimVertices = victim.vertices; // 피해자의 꼭지점 배열 가져오기

  console.log(attackerVertices);
  console.log(victimVertices);

  // 공격자의 방향에 따라 맞닿은 경계선의 인덱스를 결정합니다.
  const boundaryIndex = attackDirection;

  // 공격자의 방향에 따라 해당 방향의 꼭지점이 victim의 경계선과 맞닿아 있는지를 확인합니다.
  const vertex = attackerVertices[boundaryIndex];
  console.log(vertex);
  // vertex가 victim의 경계선과 맞닿아 있는지 확인합니다.
  return Matter.Vertices.contains(victimVertices, vertex);
}
