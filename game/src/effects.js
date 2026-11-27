import { GROUND, HEIGHT, RUNNER_SCALE, RUNNER_X, WIDTH } from './config.js';
import { turkey } from './actors.js';
import { ellipse, line, shape, sparkle } from './draw.js';

export function chaseWind(c, world, pose) {
  const intensity = world.frenzy > 0 ? 1 : world.lift > 0 ? 0.72 : 0.27;
  c.save();
  c.globalAlpha = intensity;
  for (let i = 0; i < 21; i++) {
    const row = i * 37 % 326;
    const x = ((i * 373 - pose * (232 + i % 4 * 43)) % 1490 + 1490) % 1490 - 100;
    const y = 242 + row;
    const length = (16 + i % 6 * 12) * (row > 234 ? 1 : 0.68);
    line(c, [[x, y + 3], [x + length, y]], i % 3 ? '#fff1c2a8' : '#9f563640', 1.2 + i % 3 * 0.45);
  }
  c.restore();
}

export function frenzyTrail(c, world) {
  if (world.frenzy <= 0) return;
  c.save();
  for (const [offset, alpha] of [[76, 0.13], [42, 0.26]]) {
    c.globalAlpha = alpha;
    const lift = Math.max(0, world.lift - world.velocity * offset / 480);
    turkey(c, RUNNER_X - offset, GROUND - lift, {
      scale: RUNNER_SCALE, stride: world.stride - offset * 0.026, duck: world.duck, air: lift > 0,
    });
  }
  c.restore();
  for (let i = 0; i < 14; i++) {
    const offset = (i * 37 + world.time * 306) % 210;
    const x = RUNNER_X - 48 - offset;
    const y = GROUND - world.lift * (1 - offset / 270) - 34 + Math.sin(i * 19) * 27;
    line(c, [[x - 6 - i % 4 * 6, y], [x, y]], '#ffdc6485', 1.8);
    sparkle(c, x, y, 2 + i % 4, i % 3 ? '#ffe368' : '#fff5c8');
  }
}

export function shieldHalo(c, world, pose) {
  if (!world.shield) return;
  const x = RUNNER_X - 14;
  const y = GROUND - world.lift - (world.duck ? 34 : 63);
  const ry = world.duck ? 47 : 77;
  const glow = c.createRadialGradient(x, y, 34, x, y, 108);
  glow.addColorStop(0, '#ffde6b32');
  glow.addColorStop(0.65, '#ffdf7756');
  glow.addColorStop(1, '#ffdf7700');
  ellipse(c, x, y, 120, ry * 1.17, glow);
  for (const [start, span] of [[0.18, 1.9], [2.51, 2.12], [5.1, 1.03]]) {
    shape(c, '', p => p.ellipse(x, y, 109, ry, -0.15, pose * 0.71 + start, pose * 0.71 + start + span), '#fff0a7bd', 2);
  }
  for (let i = 0; i < 5; i++) {
    const angle = pose * 1.6 + i * Math.PI * 0.4;
    sparkle(c, x + Math.cos(angle) * 109, y + Math.sin(angle) * ry, 4 + i % 3, '#fff3ad');
  }
}

export function frenzyEdges(c, world, pose) {
  if (world.frenzy <= 0) return;
  c.save();
  c.globalAlpha = Math.min(1, world.frenzy * 2) * (0.62 + 0.16 * Math.sin(pose * 7));
  for (const [x, y, dx, dy, width, height] of [[0, 0, 0, 118, WIDTH, 118],
    [0, HEIGHT, 0, -128, WIDTH, 128], [0, 0, 112, 0, 112, HEIGHT],
    [WIDTH, 0, -112, 0, 112, HEIGHT]]) {
    const glow = c.createLinearGradient(x, y, x + dx, y + dy);
    glow.addColorStop(0, '#ffca33d9');
    glow.addColorStop(1, '#ffcb4000');
    c.fillStyle = glow;
    c.fillRect(x + Math.min(dx, 0), y + Math.min(dy, 0), width, height);
  }
  for (let i = 0; i < 22; i++) {
    const x = i % 2 ? 25 + i * 7 % 56 : WIDTH - 27 - i * 11 % 53;
    const y = (i * 109 + pose * (45 + i % 5 * 18)) % HEIGHT;
    sparkle(c, x, y, 3 + i % 4, '#fff1b0');
  }
  c.restore();
}

const callouts = {
  combo: { dx: 127, dy: 0, tilt: 0.072, color: '#fff1a1', size: 35 },
  near: { dx: -58, dy: -47, tilt: -0.074, color: '#ffebbf', size: 29 },
  shield: { dx: 126, dy: -45, tilt: 0.06, color: '#fff0aa', size: 24 },
  frenzy: { dx: -21, dy: -87, tilt: -0.037, color: '#ffda6a', size: 38 },
};

export function playNotices(c, world) {
  const base = Math.max(328, GROUND - world.lift - 107);
  for (const message of world.notices) {
    const { dx, dy, tilt, color, size } = callouts[message.kind];
    const age = message.duration - message.time;
    c.save();
    c.globalAlpha = Math.min(1, message.time * 4);
    c.translate(RUNNER_X + dx, base + dy - age * 24);
    c.rotate(tilt);
    c.font = `950 ${size}px system-ui, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const width = c.measureText(message.text).width;
    c.strokeStyle = '#9e5138';
    c.lineWidth = 7;
    c.strokeText(message.text, 1, 4);
    c.strokeStyle = '#522b2c';
    c.lineWidth = 5;
    c.strokeText(message.text, 0, 0);
    c.fillStyle = color;
    c.fillText(message.text, 0, 0);
    sparkle(c, -width / 2 - 11, 0, 6, '#fff0aa');
    sparkle(c, width / 2 + 11, -6, 8, '#fff3b8');
    c.restore();
  }
}
