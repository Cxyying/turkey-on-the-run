import { FINISH, MAX_LIVES, PIXELS_PER_METER, STEP } from './config.js';
import { randomStream } from './random.js';

export const hazards = {
  hay: { width: 68, height: 53 },
  oven: { width: 71, height: 70 },
  fence: { width: 65, height: 61 },
  knife: { width: 76, height: 17, lift: 46 },
  mud: { width: 105, height: 5 },
};

const groundHazards = ['hay', 'oven', 'fence', 'mud'];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function course(seed) {
  const random = randomStream(seed);
  const things = [];
  const hazard = (kind, meter) => things.push({ kind, meter, x: meter });
  const corn = (meter, lift, gold = false) => things.push({
    kind: gold ? 'gold' : 'corn', meter, x: meter, lift,
  });

  for (const meter of [19, 23, 27]) corn(meter, 31);
  hazard('hay', 49);
  for (const [meter, lift] of [[43, 78], [49, 117], [55, 78]]) corn(meter, lift);
  for (const meter of [71, 76, 81]) corn(meter, 33);
  hazard('knife', 130);
  for (const meter of [107, 112, 117]) corn(meter, 17, meter === 112);
  hazard('oven', 153);
  for (const [meter, lift] of [[147, 80], [153, 116], [159, 80]]) corn(meter, lift);
  hazard('mud', 195);
  for (const meter of [190, 195, 200]) corn(meter, 81);

  let meter = 232;
  let previous = '';
  while (meter < FINISH - 32) {
    const knife = previous !== 'knife' && random() < 0.28;
    const kind = knife ? 'knife' : groundHazards[Math.floor(random() * groundHazards.length)];
    const gold = random() < 0.46;
    if (knife) {
      hazard(kind, meter + 20);
      for (const offset of [-6, 0, 6]) corn(meter + offset, 17, gold && offset === 0);
    } else {
      hazard(kind, meter);
      for (const offset of [-6, 0, 6]) {
        const lift = offset === 0 && kind !== 'mud' ? 117 : 80;
        corn(meter + offset, lift, gold && offset === 0);
      }
    }
    previous = kind;
    meter += 30 + Math.floor(random() * 14);
  }
  for (const offset of [22, 17, 12]) corn(FINISH - offset, 33, offset === 12);
  return things.sort((a, b) => a.meter - b.meter);
}

export function createWorld(seed) {
  return {
    distance: 0, gap: 19, lives: MAX_LIVES, score: 0, time: 0, stride: 0, chaseStride: 0,
    lift: 0, velocity: 0, duck: false, jumpBuffer: 0, stumble: 0, immunity: 0,
    shake: 0, dustClock: 0, things: course(seed), particles: [], result: '',
    texture: randomStream(seed ^ 0xc9fdeb),
  };
}

function burst(world, kind, count, x, y) {
  for (let i = 0; i < count; i++) {
    const random = world.texture;
    const life = 0.28 + random() * 0.35;
    world.particles.push({
      kind, x: x + (random() - 0.5) * 9, y, life, maxLife: life,
      vx: -18 - random() * 72, vy: -11 - random() * 75,
      size: 2 + random() * (kind === 'dust' ? 8 : 4),
    });
  }
}

function contacts(world, action) {
  const foot = world.lift + 4;
  const head = world.lift + (world.duck ? 30 : 65);
  for (const item of world.things) {
    const dx = (item.x - world.distance) * PIXELS_PER_METER;
    if (item.used || Math.abs(dx) > 80) continue;
    const hazard = hazards[item.kind];
    if (!hazard) {
      if (Math.abs(dx) > 31 || item.lift + 14 < foot || item.lift - 14 > head) continue;
      item.used = true;
      world.score += item.kind === 'gold' ? 25 : 5;
      burst(world, 'spark', 10, dx, item.lift);
      action(item.kind);
      continue;
    }
    const base = hazard.lift ?? 0;
    if (Math.abs(dx) > hazard.width / 2 + 12 || foot >= base + hazard.height || head <= base) continue;
    item.used = true;
    if (world.immunity > 0) continue;
    world.lives -= 1;
    world.gap -= item.kind === 'mud' ? 4.4 : 5.2;
    world.stumble = item.kind === 'mud' ? 1.18 : 0.86;
    world.immunity = 1.2;
    world.shake = 0.34;
    burst(world, item.kind === 'mud' ? 'mud' : 'spark', 12, 0, 9);
    action('hit');
  }
}

export function tick(world, input = {}, action = () => {}) {
  if (world.result) return;
  world.time += STEP;
  world.stumble = Math.max(0, world.stumble - STEP);
  world.immunity = Math.max(0, world.immunity - STEP);
  world.shake = Math.max(0, world.shake - STEP);
  world.jumpBuffer = input.jump ? 0.13 : Math.max(0, world.jumpBuffer - STEP);

  if (world.lift === 0 && world.jumpBuffer > 0) {
    world.velocity = 533;
    world.jumpBuffer = 0;
    action('jump');
  }
  if (world.lift > 0 || world.velocity > 0) {
    world.lift = Math.max(0, world.lift + world.velocity * STEP);
    world.velocity = world.lift > 0 ? world.velocity - 1250 * STEP : 0;
  }
  world.duck = Boolean(input.duck && world.lift === 0);

  const runningSpeed = 25 + 5 * (world.distance / FINISH);
  const speed = runningSpeed * (world.stumble > 0 ? 0.65 : 1);
  world.distance = Math.min(FINISH, world.distance + speed * STEP);
  world.gap = clamp(world.gap + (world.stumble > 0 ? -5.6 : 1.25) * STEP, 0, 23.4);
  world.stride += speed * STEP * 0.57;
  world.chaseStride += runningSpeed * STEP * 0.51;

  for (const item of world.things) {
    if (item.kind === 'knife' && item.x - world.distance < 84) item.x -= 8.5 * STEP;
  }
  world.things = world.things.filter(item => item.x >= world.distance - 40);

  for (const particle of world.particles) {
    particle.life -= STEP;
    particle.x += (particle.vx - speed * PIXELS_PER_METER) * STEP;
    particle.y += particle.vy * -STEP;
    particle.vy += 144 * STEP;
  }
  world.particles = world.particles.filter(particle => particle.life > 0);
  world.dustClock -= STEP;
  if (world.lift === 0 && world.dustClock <= 0) {
    world.dustClock = world.duck ? 0.054 : 0.086;
    burst(world, 'dust', 2, -13, 5);
  }

  contacts(world, action);
  if (world.lives === 0 || world.gap <= 0) world.result = 'caught';
  else if (world.distance === FINISH) world.result = 'escaped';
  if (world.result) action(world.result);
}
