import { createWorld, hazards, tick } from './world.js';

export function stageShot(name, seed) {
  const world = createWorld(seed);
  if (name === 'start') return { world, screen: 'title', pose: 0.68 };
  if (name === 'win') {
    while (!world.result) {
      const next = world.things.find(item => hazards[item.kind] && !item.used && item.x >= world.distance - 7);
      const distance = next ? next.x - world.distance : Infinity;
      tick(world, {
        jump: next?.kind !== 'knife' && world.lift === 0 && distance >= 7 && distance < 11.8,
        duck: next?.kind === 'knife' && distance < 10,
      });
    }
    return { world, screen: world.result, pose: 2.1 };
  }

  let jumped = false;
  while (!world.result && (name === 'end' || world.distance < 79)) {
    const jump = !jumped && world.distance >= 39;
    tick(world, { jump });
    jumped ||= jump;
  }
  return { world, screen: world.result || 'playing', pose: world.time };
}
