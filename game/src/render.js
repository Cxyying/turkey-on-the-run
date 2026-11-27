import { CREAM, FINISH, GROUND, HEIGHT, INK, MAX_LIVES, PIXELS_PER_METER, RUNNER_SCALE, RUNNER_X, WIDTH } from './config.js';
import { farmer, turkey } from './actors.js';
import { ellipse, heart, label, line, polygon, round, shape, spaced, sparkle } from './draw.js';
import { chaseWind, frenzyEdges, frenzyTrail, playNotices, shieldHalo } from './effects.js';
import { makeLandscape } from './landscape.js';
import { COMBO_WINDOW, FRENZY_LENGTH, FRENZY_STREAK } from './mechanics.js';
import { corn, gate, goldenFeather, prop, shadow } from './props.js';
import { hazardBase, hazards } from './world.js';
import { zones } from './zones.js';

const dark = '#492c30';
const light = '#ffd584';
const unit = '800 16px system-ui, sans-serif';
const meters = value => Math.floor(value).toLocaleString('en-US');
const clock = value => `${Math.floor(value / 60)}:${String(Math.floor(value) % 60).padStart(2, '0')}`;

function panel(c, x, y, width, height, radius = 17) {
  round(c, x + 3, y + 6, width, height, radius, '#6e3c36ad');
  round(c, x, y, width, height, radius, dark, '#43292b', 2);
  round(c, x + 5, y + 5, width - 10, height - 10, radius - 5, '', '#95614d', 1);
}

function display(c, text, x, y, width, size, color, edge = '#50282d') {
  c.save();
  c.translate(x, y);
  c.font = `1000 ${size}px system-ui, sans-serif`;
  c.scale(width / c.measureText(text).width, 1);
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.strokeStyle = '#a74c39';
  c.lineWidth = 13;
  c.strokeText(text, 2, 9);
  c.strokeStyle = edge;
  c.lineWidth = 8;
  c.strokeText(text, 0, 0);
  c.fillStyle = color;
  c.fillText(text, 0, 0);
  c.restore();
}

function button(c, text, x, y, width, hovered) {
  round(c, x + 1, y + 6, width, 55, 14, '#7f4036', INK, 2);
  round(c, x, y, width, 55, 14, hovered ? '#ffec9d' : '#ffd677', INK, 2);
  round(c, x + 5, y + 5, width - 10, 45, 10, '', '#fff0ae', 1.5);
  label(c, text, x + width / 2, y + 34, '850 18px system-ui, sans-serif', '#512b2d', 'center');
}

export const muteRegion = [1191, 29, 61, 50];
export const inRegion = (x, y, [left, top, w, h]) => x >= left && x <= left + w && y >= top && y <= top + h;
export const duckRegion = [1102, 623, 145, 64];

function muteControl(c, muted, hover) {
  const [x, y, w, h] = muteRegion;
  round(c, x + 2, y + 3, w, h, 12, '#6e3c36a0');
  round(c, x, y, w, h, 12, hover ? '#6d4440' : dark, '#8f5b49', 1.5);
  c.save();
  c.translate(x + 29, y + 21);
  polygon(c, [[-13, -4], [-8, -4], [-2, -9], [-2, 9], [-8, 4], [-13, 4]], CREAM);
  if (muted) {
    line(c, [[3, -4], [10, 4]], '#f58968', 2.6);
    line(c, [[3, 4], [10, -4]], '#f58968', 2.6);
  } else {
    for (const radius of [5, 9]) {
      shape(c, '', p => p.arc(-1, 0, radius, -0.79, 0.79), CREAM, 1.8);
    }
  }
  label(c, 'M', 0, 19, '800 11px system-ui, sans-serif', '#e3ad83', 'center');
  c.restore();
}

function marker(c, x, y, type) {
  const running = type === 'turkey';
  ellipse(c, x, y, 10, 10, running ? '#ffd67c' : '#d98669', 0, '#49292f', 2);
  c.save();
  c.translate(x, y);
  if (running) {
    ellipse(c, -1, 1.5, 5, 3.7, '#9b4e3a', -0.19);
    ellipse(c, 2, -2, 2.7, 3.2, '#b5503d');
    polygon(c, [[4, -3], [7, -1], [4, 0]], '#fff1b9');
    ellipse(c, 2.9, -2.7, 0.65, 0.65, INK);
  } else {
    ellipse(c, 0, 2, 3.5, 4.1, '#fed19b');
    round(c, -5.6, -2.9, 11.2, 2.3, 1, '#753e39');
    round(c, -3.3, -5.3, 6.5, 3.3, 1, '#753e39');
  }
  c.restore();
}

function statusStrip(c, world) {
  const active = world.frenzy > 0;
  panel(c, 28, 131, 340, 47, 12);
  label(c, `COMBO ×${world.combo || 1}`, 45, 160, '900 16px system-ui, sans-serif', world.combo > 1 ? '#ffdf82' : CREAM);
  round(c, 45, 166, 95, 2.6, 1.3, '#846052');
  if (world.comboTime > 0) round(c, 45, 166, 95 * world.comboTime / COMBO_WINDOW, 2.6, 1.3, '#ffcf6c');
  line(c, [[153, 142], [153, 167]], '#9e6852', 1.4);
  if (active) {
    label(c, `FRENZY ×2  ${world.frenzy.toFixed(1)}s`, 165, 159, '850 14px system-ui, sans-serif', '#ffe584');
    round(c, 165, 166, 119 * world.frenzy / FRENZY_LENGTH, 2.6, 1.3, '#ffe071');
  } else {
    spaced(c, 'FRENZY', 166, 151, 9, '#f4be93', 1.55);
    for (let i = 0; i < FRENZY_STREAK; i++) {
      const filled = i < world.streak % FRENZY_STREAK;
      ellipse(c, 173 + i * 14, 162, 4.2, 6, filled ? '#ffd271' : '#704441', 0.42, filled ? '#ffec9f' : '#a87158', 1);
    }
  }
  line(c, [[294, 142], [294, 167]], '#9e6852', 1.4);
  c.save();
  c.globalAlpha = world.shield ? 1 : 0.43;
  goldenFeather(c, 331, 155, world.time, 0.68, world.shield);
  c.restore();
}

function zoneBadge(c, world) {
  const zone = zones[world.zone];
  panel(c, 974, 131, 185, 47, 12);
  sparkle(c, 995, 154, 8, zone.color);
  spaced(c, zone.name, 1011, 159, 13, zone.color, 1.05);
}

function zoneBanner(c, world) {
  if (world.zoneTime <= 0) return;
  const zone = zones[world.zone];
  c.save();
  c.globalAlpha = Math.min(1, world.zoneTime * 2.2);
  const x = WIDTH / 2;
  polygon(c, [[x - 232, 190], [x + 232, 190], [x + 217, 218], [x + 232, 247], [x - 232, 247],
    [x - 218, 218]], '#503037', zone.color, 2);
  line(c, [[x - 203, 196], [x + 203, 196]], '#bc885d', 1.3);
  line(c, [[x - 203, 241], [x + 203, 241]], '#bc885d', 1.3);
  sparkle(c, x - 193, 218, 10, zone.color);
  sparkle(c, x + 193, 218, 10, zone.color);
  spaced(c, `${zone.name} — ${zone.start}m`, x, 226, 21, zone.color, 1.5, 'center');
  c.restore();
}

function hud(c, world) {
  panel(c, 28, 26, 176, 91, 16);
  corn(c, 61, 73, true, 0, 1.06);
  spaced(c, 'SCORE', 90, 56, 14, '#f4bb88', 2.3);
  label(c, String(world.score).padStart(3, '0'), 89, 91, '900 33px system-ui, sans-serif', CREAM);

  panel(c, 218, 26, 161, 91, 16);
  spaced(c, 'LIVES', 239, 56, 14, '#f4bb88', 2.3);
  for (let i = 0; i < MAX_LIVES; i++) heart(c, 253 + i * 42, 85, 27, i < world.lives);

  panel(c, 397, 26, 762, 91, 16);
  spaced(c, 'FREEDOM GATE', 423, 56, 14, '#f4bb88', 2);
  label(c, `${meters(world.distance)} / 1,200 m`, 1130, 57, '850 17px system-ui, sans-serif', CREAM, 'right');
  const start = 437;
  const width = 675;
  const current = world.distance / FINISH * width;
  const hunter = Math.max(-12, (world.distance - world.gap) / FINISH * width);
  round(c, start, 79, width, 12, 6, '#2e1d27', '#794b46', 1.6);
  if (current > 0) round(c, start, 80, current, 10, 5, '#edb45d');
  for (const zone of zones.slice(1)) {
    const x = start + width * zone.start / FINISH;
    line(c, [[x, 77], [x, 94]], zone.color, 1.7);
  }
  marker(c, start + hunter, 95, 'farmer');
  marker(c, start + current, 77, 'turkey');
  line(c, [[1118, 97], [1118, 72]], '#edb979', 2);
  polygon(c, [[1118, 73], [1139, 75], [1133, 80], [1118, 82]], '#e38c61');
  statusStrip(c, world);
  zoneBadge(c, world);
  zoneBanner(c, world);
}

function key(c, text, x, y, width) {
  round(c, x, y, width, 29, 6, '#fff1cfe9', '#643731', 1.6);
  label(c, text, x + width / 2, y + 20, '850 13px system-ui, sans-serif', '#603933', 'center');
}

function playKeys(c, touch, world) {
  panel(c, 30, 639, touch ? 224 : 455, 47, 13);
  key(c, touch ? 'TAP' : 'SPACE', 42, 648, 59);
  label(c, 'Jump', 108, 668, unit, CREAM);
  if (touch) {
    key(c, 'P', 164, 648, 26);
    label(c, 'Pause', 196, 668, '750 14px system-ui, sans-serif', CREAM);
    const [x, y, width, height] = duckRegion;
    round(c, x, y, width, height, 13, world.duck ? '#ffdc83' : dark, '#a9775b', 2);
    label(c, 'HOLD TO DUCK', x + width / 2, y + 39, unit, world.duck ? dark : CREAM, 'center');
    return;
  }
  key(c, '↓', 175, 648, 27);
  label(c, 'Hold to duck', 211, 668, unit, CREAM);
  key(c, 'P', 338, 648, 26);
  label(c, 'Pause', 373, 668, unit, CREAM);
}

function dustTrails(c, x, y, pose, long = false) {
  for (let i = 0; i < 10; i++) {
    const dx = (i * 27 + pose * (30 + i % 3 * 13)) % 157;
    const dy = i * 18 % 86;
    const start = x - dx * (long ? 1.65 : 0.76);
    line(c, [[start, y - dy], [start + 10 + i % 4 * (long ? 12 : 7), y - dy]], i % 2 ? '#fff3c795' : '#ffe2a662', 1 + i % 3 * 0.4);
  }
}

function actorsAndCourse(c, world, pose) {
  const hunterX = RUNNER_X - Math.max(0, world.gap) * PIXELS_PER_METER;
  const finishX = RUNNER_X + (FINISH - world.distance) * PIXELS_PER_METER;
  if (finishX < WIDTH + 140) gate(c, finishX, GROUND);
  for (const item of world.things) {
    const x = RUNNER_X + (item.x - world.distance) * PIXELS_PER_METER;
    if ((item.used && !item.cleared) || x < -115 || x > WIDTH + 115) continue;
    const hazard = hazards[item.kind];
    if (hazard) {
      const lift = hazard.lift ? hazardBase(item) + hazard.height / 2 : 0;
      const turns = (item.x - item.meter) * PIXELS_PER_METER / 29;
      prop(c, item.kind, x, GROUND - lift, pose, turns);
    } else {
      const lift = item.lift + Math.sin(pose * 5 + item.x) * 3;
      if (item.kind === 'feather') goldenFeather(c, x, GROUND - lift, pose, 0.8);
      else corn(c, x, GROUND - lift, item.kind === 'gold', pose, world.lift > 0 ? 1.08 : 1);
    }
  }
  dustTrails(c, hunterX + 20, GROUND - 19, pose);
  shadow(c, hunterX, GROUND, 45);
  shadow(c, RUNNER_X, GROUND, 44 - world.lift * 0.18, 0.31 - world.lift * 0.0015);
  const proximity = Math.max(0.34, 1 - (world.gap - 13) * 0.065);
  const reach = proximity * (0.5 + 0.5 * Math.max(0, Math.sin(world.chaseStride)));
  farmer(c, hunterX, GROUND, { scale: RUNNER_SCALE, stride: world.chaseStride, reach });
  for (const p of world.particles) {
    const fraction = p.life / p.maxLife;
    c.globalAlpha = fraction * (p.kind === 'dust' ? 0.74 : 1);
    const x = RUNNER_X + p.x;
    const y = Math.min(GROUND + 3, GROUND - p.y);
    if (p.kind === 'spark') sparkle(c, x, y, p.size, '#fff1a3');
    else ellipse(c, x, y, p.size * (1.2 - fraction * 0.3), p.size * 0.65, p.kind === 'mud' ? '#77483a' : '#f8c280', -0.22);
  }
  c.globalAlpha = 1;
  frenzyTrail(c, world);
  shieldHalo(c, world, pose);
  c.globalAlpha = world.immunity > 0 && Math.floor(world.time * 16) % 2 ? 0.5 : 1;
  turkey(c, RUNNER_X, GROUND - world.lift, {
    scale: RUNNER_SCALE, stride: world.stride, duck: world.duck, air: world.lift > 0,
  });
  c.globalAlpha = 1;
}

function duckHint(c, world, touch) {
  if (world.distance < 62 || world.distance > 110) return;
  const knife = world.things.find(item => item.kind === 'knife' && !item.used);
  if (!knife) return;
  const x = RUNNER_X + (knife.x - world.distance) * PIXELS_PER_METER;
  if (x > WIDTH - 100) return;
  const y = Math.min(465, GROUND - hazardBase(knife) - 62);
  round(c, x - 65, y, 130, 35, 10, '#583538', '#d08a5d', 1.4);
  polygon(c, [[x - 7, y + 34], [x + 7, y + 34], [x, y + 44]], '#583538');
  spaced(c, touch ? 'HOLD DUCK' : 'DUCK  ↓', x, y + 23, 13, CREAM, 1.7, 'center');
}

function titleBadges(c, pose) {
  for (const [i, [text, x, width]] of [['3 ZONES', 75, 116], ['COMBO ×5', 201, 139], ['FEATHER SHIELD', 350, 186]].entries()) {
    round(c, x, 425, width, 37, 9, '#613735', '#8b4c3b', 2);
    round(c, x + 4, 429, width - 8, 29, 6, '', '#ab7350', 1);
    if (i === 0) {
      polygon(c, [[x + 12, 449], [x + 19, 437], [x + 24, 444], [x + 28, 439], [x + 33, 449]], '#ffd588');
    } else if (i === 1) {
      sparkle(c, x + 22, 443, 10, '#ffdb84');
    } else {
      goldenFeather(c, x + 23, 443, pose, 0.49, false);
    }
    spaced(c, text, x + 38, 448, 12, '#fff0bf', 1.15);
  }
}

function title(c, pose, hover) {
  const left = c.createLinearGradient(0, 0, 685, 0);
  left.addColorStop(0, '#75353751');
  left.addColorStop(1, '#75353700');
  c.fillStyle = left;
  c.fillRect(0, 0, 685, HEIGHT);

  dustTrails(c, 825, GROUND - 24, pose, true);
  shadow(c, 747, GROUND - 10, 72);
  farmer(c, 751, GROUND - 13, { scale: 1.47, stride: pose * 9 });
  shadow(c, 1008, GROUND, 149, 0.31);
  turkey(c, 1007, GROUND - 9 - Math.sin(pose * 7) * 6, { scale: 2.53, stride: pose * 9, air: true });
  sparkle(c, 1115, 322, 22, '#fff4cc');
  sparkle(c, 1145, 358, 11, '#ffedb6');
  sparkle(c, 795, 281, 13, '#fff1c4');
  sparkle(c, 911, 302, 8, '#fff5d0');

  line(c, [[72, 139], [103, 139]], '#783c38', 2.3);
  sparkle(c, 111, 139, 7, '#fff0c4');
  spaced(c, 'A THANKSGIVING ESCAPE', 125, 145, 16, '#542f34', 3.6);
  c.save();
  c.translate(75, 254);
  c.rotate(-0.038);
  display(c, 'TURKEY', 0, 0, 507, 130, '#fff3d1');
  display(c, 'ON THE RUN', 3, 105, 571, 103, '#ffce6c');
  c.restore();
  label(c, 'Outrun the farmer and reach the Freedom Gate.', 76, 407, '750 21px system-ui, sans-serif', '#4d2b2c');
  titleBadges(c, pose);
  button(c, 'Press SPACE or click to run', 74, 479, 388, hover);
  round(c, 74, 550, 475, 35, 9, '#f9d393e8', '#8a523f', 1.4);
  label(c, 'SPACE / W / ↑  Jump    ·    S / ↓  Duck    ·    P  Pause', 87, 572, '800 16px system-ui, sans-serif', '#542e2e');

  line(c, [[77, 646], [103, 646]], '#f0bf7f', 1.4);
  label(c, "Dodge ovens & knives · Grab corn · Don't get caught", 118, 652, '780 18px system-ui, sans-serif', '#ffe7ba');
  spaced(c, '1,200 M TO FREEDOM', 1023, 651, 12, '#ffe1a3', 1.8);
}

function confetti(c, pose) {
  const colors = ['#ffdd76', '#f07854', '#f2f2bf', '#658879'];
  for (let i = 0; i < 35; i++) {
    const x = 653 + (i * 157 % 580);
    const y = 101 + ((i * 113 + pose * (26 + i % 5)) % 400);
    if (i % 4 === 0) sparkle(c, x, y, 6 + i % 5, '#fffbea');
    else ellipse(c, x, y, 4 + i % 6, 2, colors[i % 4], i + pose * 2);
  }
}

function catchDust(c, pose) {
  for (let i = 0; i < 17; i++) {
    const phase = (i * 0.17 + pose * 0.32) % 1;
    const x = 889 - phase * (190 + i % 5 * 12);
    const y = GROUND - 4 - phase * (28 + i % 4 * 13);
    const size = 3 + phase * 16;
    c.globalAlpha = (1 - phase) * 0.65;
    ellipse(c, x, y, size * 1.47, size * 0.75, i % 2 ? '#f0ad73' : '#ffd197', -0.18);
  }
  c.globalAlpha = 1;
  for (const [x, y, length] of [[729, 554, 71], [711, 536, 51], [758, 571, 92], [698, 566, 53]]) {
    line(c, [[x, y], [x + length, y - 7]], '#ffdfad80', 2.5);
  }
}

function ending(c, world, escaped, pose, hover) {
  if (escaped) {
    gate(c, 950, GROUND - 7, 2.02);
    dustTrails(c, 964, GROUND - 35, pose, true);
    shadow(c, 1095, GROUND, 115, 0.24);
    turkey(c, 1095, GROUND - 52 - Math.sin(pose * 4) * 13, {
      scale: 2.15, stride: pose * 10, air: true,
    });
    confetti(c, pose);
  } else {
    const veil = c.createLinearGradient(0, 0, 0, HEIGHT);
    veil.addColorStop(0, '#68384f31');
    veil.addColorStop(1, '#50263461');
    c.fillStyle = veil;
    c.fillRect(0, 0, WIDTH, HEIGHT);
    catchDust(c, pose);
    shadow(c, 823, GROUND, 95);
    shadow(c, 1051, GROUND, 115);
    turkey(c, 1066, GROUND - 10, { scale: 2.16, stride: 0, mood: 'caught' });
    farmer(c, 823, GROUND, { scale: 2.38, stopped: true, reach: 1 });
    for (const [x, y, size] of [[1122, 347, 13], [1151, 328, 8], [1149, 368, 10]]) {
      shape(c, '#fff0caaa', p => {
        p.moveTo(x, y - size);
        p.quadraticCurveTo(x + size, y + size, x, y + size);
        p.quadraticCurveTo(x - size, y + size, x, y - size);
      });
    }
  }

  panel(c, 63, 133, 570, 453, 29);
  display(c, escaped ? 'YOU ESCAPED!' : 'CAUGHT!', 96, 258, escaped ? 487 : 394,
    escaped ? 69 : 105, escaped ? '#ffd379' : '#fff0ce', '#3e242c');
  label(c, escaped ? 'Free bird!' : 'Dinner time...', 99, 314, 'italic 750 31px Georgia, serif', '#f0bd91');
  line(c, [[99, 343], [592, 343]], '#a96a56', 1.6);
  corn(c, 115, 405, true, pose, 0.89);
  spaced(c, 'SCORE', 143, 386, 13, '#eeb78e', 2.8);
  label(c, String(world.score), 141, 424, '900 34px system-ui, sans-serif', CREAM);
  line(c, [[306, 371], [306, 434]], '#97634e', 1.4);
  spaced(c, 'DISTANCE', 336, 386, 13, '#eeb78e', 2.8);
  label(c, `${meters(world.distance)} m`, 333, 424, '900 34px system-ui, sans-serif', CREAM);
  round(c, 96, 451, 497, 38, 9, '#38242c', '#805445', 1.3);
  const missLabel = world.nearMisses === 1 ? 'near miss' : 'near misses';
  const best = world.bestCombo ? `×${world.bestCombo}` : '—';
  label(c, `${world.cornCollected} corn  ·  Best combo ${best}  ·  ${world.nearMisses} ${missLabel}  ·  ${clock(world.time)} elapsed`,
    344, 475, '740 15px system-ui, sans-serif', '#f9d5aa', 'center');
  button(c, 'Press R or click to run again', 96, 508, 497, hover);
}

function pause(c, hover) {
  c.fillStyle = '#3823308f';
  c.fillRect(0, 0, WIDTH, HEIGHT);
  panel(c, 405, 218, 470, 271, 25);
  display(c, 'PAUSED', 476, 330, 326, 76, CREAM);
  button(c, 'Press P or click to resume', 448, 381, 384, hover);
}

export function createRenderer(c, seed) {
  const landscape = makeLandscape(seed);

  return function render(world, screen, pose, { muted = false, touch = false, x = -1, y = -1 } = {}) {
    const hover = x >= 0 && !inRegion(x, y, muteRegion);
    const playing = screen === 'playing' || screen === 'paused';
    c.save();
    if (playing && world.shake > 0) {
      const shake = world.shake / 0.34;
      c.translate(Math.cos(world.time * 93) * 9 * shake, Math.sin(world.time * 87) * 6 * shake);
      c.translate(WIDTH / 2, HEIGHT / 2);
      c.scale(1 + shake * 0.017, 1 + shake * 0.017);
      c.translate(-WIDTH / 2, -HEIGHT / 2);
    }
    landscape(c, screen === 'title' ? 0 : world.distance, pose, screen);
    if (playing) {
      chaseWind(c, world, pose);
      actorsAndCourse(c, world, pose);
    }
    c.restore();

    if (screen === 'title') title(c, pose, hover);
    else if (playing) {
      frenzyEdges(c, world, pose);
      playNotices(c, world);
      duckHint(c, world, touch);
      hud(c, world);
      playKeys(c, touch, world);
      if (screen === 'paused') pause(c, hover);
    } else ending(c, world, screen === 'escaped', pose, hover);
    muteControl(c, muted, inRegion(x, y, muteRegion));
  };
}
