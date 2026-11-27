import { FINISH, MAX_LIVES, PIXELS_PER_METER, STEP } from './config.js';
import {
  absorbImpact, collectCorn, collectFeather, createMechanics, recordNearMiss, updateMechanics,
} from './mechanics.js';
import { randomStream } from './random.js';
import { zoneAt } from './zones.js';

export const hazards = {
  hay: { width: 68, height: 53 },
  oven: { width: 71, height: 70 },
  fence: { width: 65, height: 61 },
  knife: { width: 76, height: 17, lift: 46, approach: 0.34 },
  mud: { width: 105, height: 5 },
  pumpkin: { width: 60, height: 58, approach: 0.56 },
};

const farmHazards = ['hay', 'oven', 'fence', 'mud'];
const fieldHazards = [...farmHazards, 'pumpkin', 'pumpkin'];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function courseItem(kind, meter, lift = 0) {
  return { kind, meter, x: meter, lift };
}

function course(seed) {
  const random = randomStream(seed);
  const things = [];
  const hazard = (kind, meter) => things.push(courseItem(kind, meter));
  const corn = (meter, lift, kind = 'corn') => things.push(courseItem(kind, meter, lift));

  for (const meter of [19, 23, 27]) corn(meter, 31);
  hazard('hay', 49);
  for (const [meter, lift] of [[43, 78], [49, 117], [55, 95]]) corn(meter, lift);
  for (const meter of [71, 76, 81]) corn(meter, 33);
  hazard('knife', 117);
  corn(106, 24);
  corn(112, 20, 'gold');
  corn(122, 18, 'feather');
  hazard('oven', 153);
  for (const [meter, lift] of [[147, 80], [153, 116], [159, 92]]) corn(meter, lift);
  hazard('mud', 195);
  for (const meter of [190, 195, 200]) corn(meter, 88);
  hazard('pumpkin', 232);
  for (const [meter, lift] of [[226, 71], [232, 110], [238, 91]]) corn(meter, lift);

  let meter = 270;
  let previous = 'pumpkin';
  while (meter < FINISH - 32) {
    const ground = meter < 400 ? farmHazards : fieldHazards;
    const knife = previous !== 'knife' && random() < 0.27;
    const kind = knife ? 'knife' : ground[Math.floor(random() * ground.length)];
    const gold = random() < 0.37;
    hazard(kind, meter);
    for (const offset of [-6, 0, 6]) {
      const lift = knife ? 21 : offset === 0 && kind !== 'mud' ? 115 : 87;
      corn(meter + offset, lift, gold && offset === 0 ? 'gold' : 'corn');
    }
    if (random() < 0.22) corn(meter + 15, 30, 'feather');
    previous = kind;
    meter += 32 + Math.floor(random() * 12);
  }
  for (const offset of [22, 17, 12]) corn(FINISH - offset, 33, offset === 12 ? 'gold' : 'corn');
  return things.sort((a, b) => a.meter - b.meter);
}

export function createWorld(seed) {
  return {
    ...createMechanics(),
    distance: 0, gap: 19, lives: MAX_LIVES, score: 0, time: 0, stride: 0, chaseStride: 0,
    lift: 0, velocity: 0, duck: false, jumpBuffer: 0, stumble: 0, immunity: 0,
    shake: 0, dustClock: 0, things: course(seed), particles: [], result: '',
    zone: zoneAt(0), zoneTime: 2.6, texture: randomStream(seed ^ 0xc9fdeb),
  };
}

export function burst(world, kind, count, x, y) {
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

export function hazardBase(item) {
  if (item.kind !== 'knife') return 0;
  // The blade descends into ducking height before it reaches the turkey.
  return hazards.knife.lift + 206 * clamp((item.x - item.meter - 2.5) / 9, 0, 1);
}

function updateCourse(world) {
  for (const item of world.things) {
    const approach = hazards[item.kind]?.approach;
    if (approach) {
      // Faster hazards converge on their assigned encounter meter.
      item.x = item.meter + clamp(item.meter - world.distance, -40, 70) * approach;
    }
  }
  world.things = world.things.filter(item => item.x >= world.distance - 40);
}

function impact(world, item, action) {
  if (world.immunity > 0) return;
  if (absorbImpact(world, action)) {
    world.immunity = 0.4;
    burst(world, 'spark', 22, 0, world.lift + 36);
    return;
  }
  world.lives -= 1;
  world.gap -= item.kind === 'mud' ? 4.4 : 5.2;
  world.stumble = item.kind === 'mud' ? 1.18 : 0.86;
  world.immunity = 1.2;
  world.shake = 0.34;
  burst(world, item.kind === 'mud' ? 'mud' : 'spark', 12, 0, 9);
  action('hit');
}

function contacts(world, action) {
  const foot = world.lift + 4;
  const head = world.lift + (world.duck ? 28 : 69);
  for (const item of world.things) {
    if (item.used) continue;
    const dx = (item.x - world.distance) * PIXELS_PER_METER;
    const hazard = hazards[item.kind];
    if (!hazard) {
      if (Math.abs(dx) > 31 || item.lift + 14 < foot || item.lift - 14 > head) continue;
      item.used = true;
      if (item.kind === 'feather') collectFeather(world, action);
      else collectCorn(world, item.kind, action);
      burst(world, 'spark', item.kind === 'feather' ? 17 : 10, dx, item.lift);
      continue;
    }

    const reach = hazard.width / 2 + 12;
    if (dx > reach) continue;
    if (dx < -reach) {
      if (item.close) {
        recordNearMiss(world, action);
        burst(world, 'spark', 9, dx, hazardBase(item) + hazard.height + 5);
      }
      item.cleared = true;
      item.used = true;
      continue;
    }
    const base = hazardBase(item);
    const clearance = Math.max(foot - base - hazard.height, base - head);
    if (clearance < 0) {
      item.used = true;
      impact(world, item, action);
    } else if (clearance <= 23) {
      // Pay once at the trailing edge, after the whole obstacle is cleared.
      item.close = true;
    }
  }
}

function updateParticles(world, speed) {
  for (const particle of world.particles) {
    particle.life -= STEP;
    particle.x += (particle.vx - speed * PIXELS_PER_METER) * STEP;
    particle.y -= particle.vy * STEP;
    particle.vy += 144 * STEP;
  }
  world.particles = world.particles.filter(particle => particle.life > 0);
  world.dustClock -= STEP;
  if (world.lift === 0 && world.dustClock <= 0) {
    world.dustClock = world.duck ? 0.054 : 0.086;
    burst(world, 'dust', 2, -13, 5);
  }
}

export function tick(world, input = {}, action = () => {}) {
  if (world.result) return;
  world.time += STEP;
  world.stumble = Math.max(0, world.stumble - STEP);
  world.immunity = Math.max(0, world.immunity - STEP);
  world.shake = Math.max(0, world.shake - STEP);
  world.jumpBuffer = input.jump ? 0.13 : Math.max(0, world.jumpBuffer - STEP);
  updateMechanics(world, STEP);

  if (world.lift === 0 && world.jumpBuffer > 0) {
    world.velocity = 533;
    world.jumpBuffer = 0;
    burst(world, 'dust', 6, -12, 6);
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

  const zone = zoneAt(world.distance);
  world.zoneTime = zone === world.zone ? Math.max(0, world.zoneTime - STEP) : 3;
  world.zone = zone;
  updateCourse(world);
  updateParticles(world, speed);
  contacts(world, action);

  if (world.lives === 0 || world.gap <= 0) world.result = 'caught';
  else if (world.distance === FINISH) world.result = 'escaped';
  if (world.result) action(world.result);
}
