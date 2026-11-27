export const COMBO_WINDOW = 2.8;
export const FRENZY_LENGTH = 5;
export const FRENZY_STREAK = 8;
const NEAR_MISS_POINTS = 10;

const comboTiers = [[7, 5], [5, 3], [3, 2], [1, 1]];

export function createMechanics() {
  return {
    streak: 0, combo: 0, comboTime: 0, frenzy: 0, shield: false,
    cornCollected: 0, bestCombo: 0, nearMisses: 0, notices: [],
  };
}

export function notice(world, kind, text, duration = 1.2) {
  // Refresh a repeated callout instead of stacking it on itself.
  world.notices = world.notices.filter(message => message.kind !== kind);
  world.notices.push({ kind, text, time: duration, duration });
}

export function breakCombo(world) {
  world.streak = 0;
  world.combo = 0;
  world.comboTime = 0;
}

export function updateMechanics(world, step) {
  world.comboTime = Math.max(0, world.comboTime - step);
  if (!world.comboTime && world.streak) breakCombo(world);
  world.frenzy = Math.max(0, world.frenzy - step);
  for (const message of world.notices) message.time -= step;
  world.notices = world.notices.filter(message => message.time > 0);
}

function award(world, points) {
  const value = points * (world.frenzy > 0 ? 2 : 1);
  world.score += value;
  return value;
}

export function collectCorn(world, kind, action) {
  world.streak += 1;
  world.cornCollected += 1;
  world.comboTime = COMBO_WINDOW;
  const previous = world.combo;
  world.combo = comboTiers.find(([minimum]) => world.streak >= minimum)[1];
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  if (world.combo > 1 && world.combo !== previous) notice(world, 'combo', `COMBO ×${world.combo}`, 1.45);

  if (world.streak % FRENZY_STREAK === 0) {
    world.frenzy = FRENZY_LENGTH;
    notice(world, 'frenzy', 'CORN FRENZY!', 1.7);
    action('frenzy');
  }
  award(world, (kind === 'gold' ? 25 : 5) * world.combo);
  action(kind);
}

export function collectFeather(world, action) {
  world.shield = true;
  notice(world, 'shield', 'FEATHER SHIELD');
  action('feather');
}

export function absorbImpact(world, action) {
  breakCombo(world);
  if (!world.shield) return false;
  world.shield = false;
  notice(world, 'shield', 'SHIELD BLOCKED!');
  action('shield');
  return true;
}

export function recordNearMiss(world, action) {
  world.nearMisses += 1;
  const points = award(world, NEAR_MISS_POINTS);
  notice(world, 'near', `NEAR MISS +${points}`, 1.35);
  action('near');
}
