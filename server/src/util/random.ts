export function generatePlanktonSpawnProbability(): boolean {
  const probility: number = Math.random();

  if (probility < 0.9) {
    return true;
  } else {
    return false;
  }
}
