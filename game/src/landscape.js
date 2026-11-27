import { GROUND, HEIGHT, PIXELS_PER_METER, WIDTH } from './config.js';
import { randomStream } from './random.js';
import { ellipse, line, polygon, round, shape } from './draw.js';
import { createZoneScenery, farmRoad, zoneAt } from './zones.js';

const wrap = (x, period) => ((x % period) + period) % period;

function cloud(c, x, y, size, color) {
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  shape(c, color, p => {
    p.moveTo(-136, 11);
    p.quadraticCurveTo(-122, -2, -81, 0);
    p.quadraticCurveTo(-74, -24, -35, -18);
    p.quadraticCurveTo(-20, -51, 20, -35);
    p.quadraticCurveTo(46, -32, 54, -12);
    p.quadraticCurveTo(92, -17, 101, 2);
    p.quadraticCurveTo(141, 0, 155, 12);
    p.quadraticCurveTo(39, 22, -136, 11);
  });
  c.restore();
}

function birds(c, x, y) {
  for (const [dx, dy, size] of [[0, 0, 1], [22, -14, 0.7], [44, 3, 0.55]]) {
    shape(c, '', p => {
      p.moveTo(x + dx - 8 * size, y + dy);
      p.quadraticCurveTo(x + dx - 3 * size, y + dy - 3, x + dx, y + dy + 3);
      p.quadraticCurveTo(x + dx + 4 * size, y + dy - 3, x + dx + 8 * size, y + dy - 2);
    }, '#a2584d', 1.6);
  }
}

function hills(c, y, travel, amplitude, period, color) {
  shape(c, color, p => {
    p.moveTo(0, HEIGHT);
    for (let x = 0; x <= WIDTH; x += 8) {
      const angle = (x + travel) * Math.PI * 2 / period;
      p.lineTo(x, y + Math.sin(angle) * amplitude + Math.cos(angle * 2 + 1) * amplitude * 0.22);
    }
    p.lineTo(WIDTH, HEIGHT);
    p.closePath();
  });
}

function barn(c, x, y, scale) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  polygon(c, [[-93, 0], [-93, -114], [-61, -163], [5, -194], [71, -161], [102, -112], [102, 0]], '#aa4941');
  polygon(c, [[73, -158], [137, -142], [169, -98], [169, 0], [102, 0], [102, -112]], '#803a3c');
  for (let i = -83; i <= 100; i += 11) {
    line(c, [[i, i > -60 && i < 72 ? -145 : -108], [i, 0]], '#94413b', 1.5);
    line(c, [[i + 2, -99], [i + 2, 0]], '#bd5746', 1.1);
  }
  polygon(c, [[-107, -110], [-69, -170], [5, -201], [76, -170], [112, -110], [103, -104],
    [67, -157], [5, -185], [-60, -157], [-97, -103]], '#5d353d');
  polygon(c, [[5, -201], [70, -198], [142, -165], [181, -103], [112, -110], [76, -170]], '#713d47');
  line(c, [[-97, -107], [-62, -161], [5, -190], [69, -161], [104, -107]], '#f4c18d', 3);
  line(c, [[76, -170], [142, -165]], '#9d5351', 2.5);
  round(c, -17, -146, 45, 38, 1, '#65313a', '#f4bd85', 3);
  line(c, [[5, -145], [5, -108]], '#ebad77', 2.5);
  line(c, [[-16, -127], [26, -127]], '#ebad77', 2.5);
  round(c, -38, -75, 88, 78, 2, '#7f3634', '#efb47e', 4);
  line(c, [[-35, -72], [47, -4], [47, -72], [-35, -4], [-35, -72]], '#e4a372', 4);
  line(c, [[6, -73], [6, 1]], '#edbb87', 3);
  round(c, 123, -72, 25, 31, 2, '#572f37', '#cc875e', 3);
  c.restore();
}

function tree(c, x, y, size, variant) {
  const colors = [
    ['#9e4437', '#ba5036', '#d36739', '#ee8844', '#f4a756'],
    ['#a75a32', '#bf7537', '#d9973d', '#ebb04e', '#f8c366'],
    ['#88384a', '#a34448', '#bd504b', '#d96552', '#ed8c63'],
  ][variant];
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  polygon(c, [[-12, 0], [-6, -45], [-13, -86], [-5, -93], [4, -66], [21, -103], [28, -98],
    [9, -52], [13, 0]], '#6e4333');
  line(c, [[0, -5], [1, -42], [-3, -67]], '#a86546', 2.4);
  const canopy = [[-2, -120, 54, 48], [-41, -112, 37, 38], [41, -116, 43, 38],
    [-52, -136, 39, 38], [1, -150, 59, 46], [44, -151, 38, 39], [-23, -174, 39, 28],
    [12, -175, 40, 32], [-24, -152, 32, 28], [24, -139, 29, 22], [-56, -146, 24, 20]];
  for (const [index, [dx, dy, rx, ry]] of canopy.entries()) {
    ellipse(c, dx, dy, rx, ry, colors[Math.min(4, Math.floor(index / 2.4))], -0.17);
  }
  for (const [dx, dy, size] of [[-34, -166, 6], [28, -188, 8], [56, -139, 5], [-62, -128, 6],
    [10, -142, 6], [-24, -120, 4], [66, -157, 7], [-55, -161, 5], [4, -190, 6]]) {
    ellipse(c, dx, dy, size, 2.2, colors[4], -0.4);
  }
  c.restore();
}

function grass(c, x, y, size, color) {
  shape(c, color, p => {
    p.moveTo(x - size * 0.4, y);
    p.quadraticCurveTo(x - size * 0.6, y - size * 0.6, x - size, y - size * 0.83);
    p.quadraticCurveTo(x - size * 0.25, y - size * 0.68, x, y - size * 0.32);
    p.quadraticCurveTo(x + size * 0.1, y - size, x + size * 0.51, y - size * 1.15);
    p.quadraticCurveTo(x + size * 0.37, y - size * 0.69, x + size * 0.33, y - size * 0.42);
    p.quadraticCurveTo(x + size * 0.58, y - size * 0.75, x + size, y - size * 0.65);
    p.quadraticCurveTo(x + size * 0.56, y - size * 0.32, x + size * 0.48, y);
  });
}

function drawRoad(c, travel, freckles, palette) {
  const soil = c.createLinearGradient(0, GROUND - 4, 0, HEIGHT);
  soil.addColorStop(0, palette.soil[0]);
  soil.addColorStop(0.26, palette.soil[1]);
  soil.addColorStop(1, palette.soil[2]);
  c.fillStyle = soil;
  c.fillRect(0, GROUND - 3, WIDTH, HEIGHT - GROUND + 3);
  line(c, [[0, GROUND - 3], [WIDTH, GROUND - 3]], palette.rim, 3);
  for (const [offset, row, size, shade] of freckles) {
    const x = wrap(offset - travel, 1560) - 90;
    const y = GROUND + row ** 1.55 * (HEIGHT - GROUND);
    if (shade > 0.81) {
      line(c, [[x - size * 28, y], [x + size * 15, y]], row > 0.4 ? palette.flecks[0] : palette.flecks[1], 1 + size);
    } else {
      ellipse(c, x, y, 1 + size * 4, 0.6 + size * 1.5, shade > 0.38 ? palette.flecks[2] : palette.flecks[3], -0.09);
    }
  }

}

export function makeLandscape(seed) {
  const zoneScenery = createZoneScenery(seed);
  const random = randomStream(seed ^ 0x98a463);
  const freckles = Array.from({ length: 330 }, () => [random() * 1560, random(), random(), random()]);
  const leaves = Array.from({ length: 24 }, () => [random() * 1490, random(), random(), random()]);
  const sprouts = Array.from({ length: 108 }, () => [random() * 1550, random(), random(), random()]);
  const skyDust = Array.from({ length: 900 }, () => [random() * WIDTH, random() * HEIGHT, random()]);

  return function landscape(c, distance, time, scene) {
    const travel = distance * PIXELS_PER_METER;
    const hero = scene === 'title';
    const zone = zoneAt(distance);
    if (zone !== 0 || scene === 'escaped') {
      const palette = zoneScenery(c, zone, travel, time, scene);
      drawRoad(c, travel, freckles, palette);
      return;
    }
    const sky = c.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, hero ? '#d88377' : '#df9979');
    sky.addColorStop(0.48, hero ? '#f2ae81' : '#f6c58b');
    sky.addColorStop(1, '#ffe1a2');
    c.fillStyle = sky;
    c.fillRect(0, 0, WIDTH, HEIGHT);

    const sunX = hero ? 981 : 968 - Math.sin(distance / 300) * 63;
    const sunY = hero ? 285 : 260;
    const sunSize = hero ? 203 : 146;
    const halo = c.createRadialGradient(sunX, sunY, sunSize * 0.72, sunX, sunY, sunSize * 1.64);
    halo.addColorStop(0, '#ffe9a2af');
    halo.addColorStop(1, '#ffe9a200');
    ellipse(c, sunX, sunY, sunSize * 1.64, sunSize * 1.64, halo);
    ellipse(c, sunX, sunY, sunSize + 10, sunSize + 10, '#ffe2a4', 0, '#ffe8aa', 1);
    const sun = c.createLinearGradient(0, sunY - sunSize, 0, sunY + sunSize);
    sun.addColorStop(0, '#fff1b7');
    sun.addColorStop(0.68, '#ffe39b');
    sun.addColorStop(1, '#ffc579');
    ellipse(c, sunX, sunY, sunSize, sunSize, sun);
    for (let i = 0; i < 7; i++) {
      const y = sunY + 12 + i * (sunSize / 7);
      const half = Math.sqrt(Math.max(0, sunSize * sunSize - (y - sunY) ** 2));
      line(c, [[sunX - half + 4, y], [sunX + half - 4, y]], '#f9b97b55', 1 + i * 0.3);
    }

    for (const [x, y, scale] of [[30, 149, 0.83], [353, 93, 0.79], [674, 185, 0.81], [1187, 109, 1.06], [1430, 213, 0.62]]) {
      const drift = wrap(x - time * 6 - travel * 0.022 + 175, 1600) - 175;
      cloud(c, drift, y + 5, scale, '#ef9d7c65');
      cloud(c, drift, y, scale, '#ffe3b58c');
      line(c, [[drift - 93 * scale, y + 25], [drift + 24 * scale, y + 25]], '#ffe2b464', 1.3);
    }
    birds(c, sunX + (hero ? 103 : 112), sunY - 67);
    if (!hero) birds(c, 330, 203);

    hills(c, 386, travel * 0.09 + 200, 43, 850, '#c78368');
    hills(c, 408, travel * 0.14 + 60, 29, 620, '#dfa268');
    const distant = wrap(travel * 0.15, 1430);
    for (let i = 0; i < 18; i++) {
      const x = wrap(i * 88 - distant + 35, 1450) - 70;
      const y = 436 + 15 * Math.sin(i * 1.8);
      ellipse(c, x, y, 45 + i % 4 * 5, 20 + i % 3 * 4, i % 2 ? '#c4814e' : '#ce8c52');
    }
    hills(c, 466, travel * 0.23, 39, 840, '#bd8d50');
    hills(c, 497, travel * 0.36 + 30, 29, 597, '#d1a354');

    const fieldShift = wrap(travel * 0.29, 254);
    for (let i = -2; i < 9; i++) {
      const x = i * 238 - fieldShift;
      shape(c, '', p => {
        p.moveTo(x - 370, 558);
        p.quadraticCurveTo(x - 30, 472, x + 370, 498 + i % 3 * 7);
      }, i % 2 ? '#af79445c' : '#efd18180', 3);
    }

    const barnX = hero ? 805 : wrap(1040 - travel * 0.32 + 270, 1780) - 270;
    barn(c, barnX, hero ? 500 : 493, hero ? 0.87 : 0.91);
    for (let i = 0; i < 8; i++) {
      const x = wrap(i * 207 + 72 - travel * 0.43, 1656) - 143;
      const y = 521 + i % 3 * 10;
      tree(c, x, y, 0.54 + i % 4 * 0.13, i % 3);
    }
    if (hero) tree(c, 1214, 520, 1.47, 2);

    hills(c, 548, travel * 0.55 + 180, 14, 833, '#b58b49');
    const fenceShift = wrap(travel * 0.68, 92);
    for (let i = -1; i < 16; i++) {
      const x = i * 92 - fenceShift;
      const y = 546 + Math.sin((x + travel * 0.68) / 100) * 4;
      const nextY = 546 + Math.sin((x + 92 + travel * 0.68) / 100) * 4;
      line(c, [[x, y - 22], [x + 92, nextY - 22]], '#956440', 6);
      line(c, [[x, y - 24], [x + 92, nextY - 24]], '#dfb473', 2);
      line(c, [[x, y - 6], [x + 92, nextY - 6]], '#a27443', 5);
      polygon(c, [[x - 4, y + 6], [x - 4, y - 33], [x + 1, y - 38], [x + 6, y - 34], [x + 6, y + 5]], '#92623f');
      line(c, [[x - 3, y + 2], [x - 3, y - 33], [x + 1, y - 36]], '#d4a468', 2);
    }
    for (const [offset, y, size, shade] of sprouts) {
      const x = wrap(offset - travel * 0.82, 1550) - 90;
      grass(c, x, 560 + y * 23, size * 9 + 3, shade > 0.56 ? '#936e42' : '#d2a658');
    }

    drawRoad(c, travel, freckles, farmRoad);
    for (const [offset, row, size, shade] of leaves) {
      const x = wrap(offset - travel * 0.48 - time * (8 + size * 12), 1490) - 100;
      const y = 270 + row * 274 + 13 * Math.sin(time * 2 + offset);
      ellipse(c, x, y, 2 + size * 5, 1 + size * 2.1, shade > 0.48 ? '#b95d3d' : '#f8cc77', time * 2 + offset);
    }
    for (const [x, y, shade] of skyDust) {
      c.fillStyle = shade > 0.5 ? '#fff7d115' : '#74312314';
      c.fillRect(x, y, 1.5, 1);
    }
  };
}
