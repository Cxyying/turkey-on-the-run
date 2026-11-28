import { burst, courseItem, createWorld, hazards, tick } from './world.js';
import { zoneAt, zones } from './zones.js';

function autoplay(world, dodgeUntil = Infinity) {
  while (!world.result) {
    if (world.distance >= dodgeUntil) {
      tick(world);
      continue;
    }
    const hazard = world.things.find(item => hazards[item.kind] && !item.used);
    const ahead = hazard ? hazard.meter - world.distance : Infinity;
    tick(world, {
      jump: hazard?.kind !== 'knife' && world.lift === 0 && ahead >= 7 && ahead < 10.6,
      duck: hazard?.kind === 'knife' && ahead < 10,
    });
  }
}

function harvestReplay(world) {
  // Shoot a short, repeatable stretch of the harvest chase with the normal game clock.
  world.distance = 586;
  world.gap = 12.3;
  world.score = 330;
  world.time = 22;
  world.zone = zoneAt(world.distance);
  world.zoneTime = 0;
  world.things = [
    ...[590, 594, 598, 602].map(meter => courseItem('corn', meter, 30)),
    courseItem('oven', 615.6),
    courseItem('corn', 619.8, 129),
    courseItem('corn', 625, 119),
    courseItem('corn', 631, 72),
    courseItem('corn', 637, 33),
    courseItem('pumpkin', 652.8),
    courseItem('knife', 662.8),
  ];

  let jumped = false;
  while (world.distance < 620 && !world.result) {
    const jump = !jumped && world.distance >= 605.8;
    tick(world, { jump });
    jumped ||= jump;
  }
  world.shield = true;
  world.chaseStride = Math.PI * 0.66;
  for (const [x, y, count] of [[-273, 15, 6], [-245, 24, 4], [-222, 13, 9], [-196, 7, 12], [-125, 5, 5]]) {
    burst(world, 'dust', count, x, y);
  }
  burst(world, 'spark', 9, 8, 132);
  burst(world, 'spark', 4, 48, 123);
}

export function stageShot(name, seed) {
  const world = createWorld(seed);
  if (name === 'start') return { world, screen: 'title', pose: 0.68 };
  if (name === 'win') {
    autoplay(world);
    return { world, screen: world.result, pose: 2.1 };
  }
  if (name === 'end') {
    // Dodge through the first two zones, then let the woods hazards end the run.
    autoplay(world, zones[2].start);
    return { world, screen: world.result, pose: 0.35 };
  }
  harvestReplay(world);
  return { world, screen: world.result || 'playing', pose: world.time };
}
