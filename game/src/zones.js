import { GROUND, HEIGHT, WIDTH } from './config.js';
import { ellipse, line, polygon, round, shape, sparkle } from './draw.js';
import { randomStream } from './random.js';

export const zones = [
  { start: 0, name: 'SUNRISE FARM', color: '#ffd48b' },
  { start: 400, name: 'HARVEST FIELDS', color: '#ffd56b' },
  { start: 800, name: 'MOONLIT WOODS', color: '#c5d7ff' },
];

export function zoneAt(distance) {
  return distance >= zones[2].start ? 2 : distance >= zones[1].start ? 1 : 0;
}

export const farmRoad = {
  soil: ['#ca854e', '#a96143', '#623840'], rim: '#f2bc72',
  flecks: ['#d78d5b4b', '#f6bc796d', '#753e414f', '#eda16d65'],
};

const harvestRoad = {
  soil: ['#d49438', '#a85d2c', '#70402d'], rim: '#ffd680',
  flecks: ['#e6a35577', '#ffe49186', '#833c2c50', '#efb36670'],
};

const woodsRoad = {
  soil: ['#454059', '#322d48', '#1d1a32'], rim: '#b0a1cc',
  flecks: ['#6d638964', '#bdafe06b', '#1b193455', '#9283af53'],
};

const dawnRoad = {
  soil: ['#d4a75f', '#aa784e', '#6d5043'], rim: '#fff0a7',
  flecks: ['#e8bc7b5b', '#fff0b67c', '#6947354f', '#f0c49465'],
};

const wrap = (x, period) => ((x % period) + period) % period;

function gradient(c, colors, height = GROUND) {
  const sky = c.createLinearGradient(0, 0, 0, height);
  colors.forEach(([position, color]) => sky.addColorStop(position, color));
  c.fillStyle = sky;
  c.fillRect(0, 0, WIDTH, HEIGHT);
}

function halo(c, x, y, radius, color) {
  const glow = c.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(1, color.slice(0, 7) + '00');
  ellipse(c, x, y, radius, radius, glow);
}

function cloudBank(c, x, y, width, height, color) {
  shape(c, color, p => {
    p.moveTo(x - width, y);
    p.bezierCurveTo(x - width * 0.72, y - height * 0.55, x - width * 0.58, y - height * 0.45, x - width * 0.43, y - height * 0.47);
    p.bezierCurveTo(x - width * 0.23, y - height * 1.5, x + width * 0.14, y - height * 0.95, x + width * 0.26, y - height * 0.55);
    p.bezierCurveTo(x + width * 0.45, y - height * 0.61, x + width * 0.57, y - height * 0.15, x + width, y);
    p.quadraticCurveTo(x + width * 0.12, y + height * 0.45, x - width, y);
  });
}

function ridge(c, y, shift, amplitude, period, color) {
  shape(c, color, p => {
    p.moveTo(0, HEIGHT);
    for (let x = 0; x <= WIDTH; x += 10) {
      const angle = (x + shift) * Math.PI * 2 / period;
      p.lineTo(x, y + Math.sin(angle) * amplitude + Math.cos(angle * 2.35) * amplitude * 0.22);
    }
    p.lineTo(WIDTH, HEIGHT);
    p.closePath();
  });
}

function terrace(c, x, y, width, lift, color, thickness) {
  shape(c, '', p => {
    p.moveTo(x - width, y + lift * 0.35);
    p.bezierCurveTo(x - width * 0.25, y - lift, x + width * 0.52, y - lift, x + width, y);
  }, color, thickness);
}

function fieldBarn(c, x, y, size) {
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  polygon(c, [[-93, 2], [-92, -73], [-38, -109], [26, -81], [26, 2]], '#b25a36', '#6e3e33', 2.3);
  polygon(c, [[26, 2], [25, -77], [115, -78], [114, 2]], '#8a4636', '#6e3e33', 2.3);
  for (let x = -85; x < 111; x += 11) {
    line(c, [[x, -74], [x, 1]], x < 24 ? '#ce7650' : '#9e533a', 1.2);
  }
  polygon(c, [[-103, -71], [-40, -129], [48, -128], [126, -76], [22, -76], [-39, -112], [-92, -67]], '#743b34', '#65352e', 2.7);
  for (let i = 0; i < 5; i++) {
    line(c, [[-36 + i * 13, -120 + i * 7], [48 + i * 14, -120 + i * 7]], '#ae6041', 1.3);
  }
  line(c, [[-92, -70], [-39, -115], [22, -76], [122, -76]], '#f5c57b', 2.8);
  round(c, -62, -47, 45, 47, 1, '#73382c', '#edb36b', 3);
  line(c, [[-60, -45], [-19, -2], [-19, -45], [-60, -2]], '#ce8754', 2.2);
  round(c, -48, -87, 17, 15, 1, '#633527', '#ffd18a', 1.8);
  for (const x of [47, 84]) round(c, x, -53, 16, 18, 1, '#68392e', '#d69557', 1.8);
  c.restore();
}

function windmill(c, x, y, time) {
  c.save();
  c.translate(x, y);
  polygon(c, [[-38, 4], [-24, -114], [20, -114], [34, 4]], '#ebba69', '#864b35', 2);
  polygon(c, [[12, -114], [20, -114], [34, 4], [12, 4]], '#b57242');
  for (let y = -92; y < 0; y += 13) line(c, [[-19 + y * 0.035, y], [18 - y * 0.04, y]], '#c8874c', 1.5);
  round(c, -12, -37, 20, 40, 6, '#925237', '#6a3a2d', 2);
  round(c, -7, -82, 11, 16, 3, '#905139', '#ffd788', 2);
  polygon(c, [[-32, -110], [-28, -124], [-2, -150], [27, -124], [30, -111]], '#9b5136', '#744032', 2.5);
  line(c, [[-28, -115], [-2, -143], [18, -125]], '#efaa5e', 2);
  c.translate(-1, -118);
  c.rotate(time * 0.48 + 0.38);
  for (let i = 0; i < 4; i++) {
    c.rotate(Math.PI / 2);
    line(c, [[0, 0], [0, -86]], '#63392f', 3.5);
    polygon(c, [[2, -17], [2, -83], [22, -80], [21, -28]], '#fff0b3', '#955637', 1.8);
    for (let y = -77; y < -23; y += 10) line(c, [[3, y], [20, y + 1]], '#c18a55', 1.2);
    line(c, [[10, -81], [10, -21]], '#c68b52', 1.3);
  }
  ellipse(c, 0, 0, 7, 7, '#e2a25b', 0, '#643629', 2);
  c.restore();
}

function stalk(c, x, y, size, lean, stem, seed) {
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  c.rotate(lean);
  shape(c, '', p => {
    p.moveTo(0, 4);
    p.quadraticCurveTo(3, -23, -1, -57);
  }, stem, 2);
  shape(c, seed, p => {
    p.moveTo(0, -11);
    p.quadraticCurveTo(-14, -21, -17, -35);
    p.quadraticCurveTo(1, -30, 0, -11);
    p.moveTo(2, -23);
    p.quadraticCurveTo(7, -38, 16, -43);
    p.quadraticCurveTo(14, -30, 2, -23);
  });
  for (let i = 0; i < 4; i++) {
    const y = -49 - i * 5;
    ellipse(c, -4, y, 2.7, 6.4, seed, -0.62);
    ellipse(c, 3, y - 2, 2.6, 6.1, seed, 0.49);
  }
  ellipse(c, -1, -73, 2.2, 6.3, seed, 0.08);
  line(c, [[-1, -54], [-1, -77]], stem, 1);
  c.restore();
}

function harvest(c, travel, time, details) {
  gradient(c, [[0, '#ed9d4e'], [0.40, '#f9c66a'], [0.70, '#ffe39b'], [1, '#f6c261']]);
  const sunX = 1065 - Math.sin(travel / 3100) * 35;
  halo(c, sunX, 258, 310, '#fff0a5f0');
  ellipse(c, sunX, 258, 123, 123, '#ffe9a2', 0, '#fff0b9', 2);
  ellipse(c, sunX, 250, 116, 116, '#fff1b4');
  for (const [x, y, width, height] of [[20, 192, 270, 32], [450, 227, 205, 27], [660, 162, 113, 20], [1300, 230, 245, 28]]) {
    const drift = wrap(x + 235 - travel * 0.026 - time * 2, 1760) - 235;
    cloudBank(c, drift, y + 10, width, height, '#e7a65d81');
    cloudBank(c, drift, y, width, height, '#ffe3a9c5');
    line(c, [[drift - width * 0.64, y + 12], [drift + width * 0.63, y + 12]], '#fff2c277', 1.7);
  }

  ridge(c, 371, travel * 0.085, 34, 810, '#d79d55');
  ridge(c, 397, travel * 0.13, 42, 1160, '#e9ad52');
  for (let i = 0; i < 16; i++) {
    const x = wrap(i * 97 - travel * 0.17, 1552) - 102;
    const y = 420 + Math.sin(i * 1.78) * 18;
    ellipse(c, x, y, 50, 25, i % 2 ? '#c69446' : '#d69f4c');
    ellipse(c, x - 10, y - 8, 37, 21, i % 2 ? '#d8a84c' : '#e6b451');
  }
  ridge(c, 451, travel * 0.21, 34, 1031, '#dca749');
  ridge(c, 475, travel * 0.29 + 60, 31, 940, '#ebba50');
  for (let i = -2; i < 8; i++) {
    const x = i * 265 - wrap(travel * 0.33, 265);
    terrace(c, x, 511 + (i % 3) * 6, 409, 66, '#b878369b', 3);
    terrace(c, x + 34, 526 + (i % 3) * 9, 398, 65, '#ffdf78ba', 3.5);
  }

  const millX = wrap(1056 - travel * 0.27 + 140, 1680) - 140;
  const barnX = wrap(1574 - travel * 0.31 + 156, 1700) - 156;
  ellipse(c, millX, 496, 69, 8, '#b47b3d65');
  windmill(c, millX, 495, time);
  ellipse(c, barnX, 513, 140, 10, '#b47b3d70');
  fieldBarn(c, barnX, 510, 0.91);

  ridge(c, 545, travel * 0.48 + 40, 13, 730, '#bf8a34');
  for (const [offset, row, size, tone] of details) {
    const x = wrap(offset - travel * (row < 0.45 ? 0.53 : 0.79), 1510) - 105;
    if (x < -24 || x > WIDTH + 24) continue;
    const scale = 0.29 + size * 0.43 + row * 0.56;
    const y = 522 + row * 60;
    const lean = 0.14 + Math.sin(time * 2.6 + offset * 0.04) * 0.14;
    stalk(c, x, y, scale, lean, tone > 0.4 ? '#a8742b' : '#df9f3d', tone > 0.4 ? '#edbc51' : '#ffe28b');
  }
  for (const [offset, row, size, tone] of details.slice(0, 25)) {
    const x = wrap(offset - travel * 0.55 - time * 16, 1510) - 70;
    const y = 333 + row * 222 + 17 * Math.sin(time * 1.8 + offset);
    ellipse(c, x, y, size * 3 + 1, size * 1.4 + 0.6, tone > 0.5 ? '#fff1b0a0' : '#b6794390', time * 1.5 + offset);
  }
  return harvestRoad;
}

function pine(c, x, y, size, colors) {
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  const [body, shade, edge] = colors;
  round(c, -4, -44, 8, 45, 1, shade);
  polygon(c, [[0, -141], [7, -119], [19, -106], [12, -106], [31, -80], [20, -80],
    [42, -51], [28, -53], [52, -22], [32, -24], [19, -19], [3, -27], [-17, -17],
    [-31, -23], [-51, -22], [-28, -53], [-42, -51], [-19, -81], [-30, -78],
    [-11, -108], [-18, -105]], body);
  polygon(c, [[0, -140], [1, -102], [8, -108], [3, -69], [16, -78], [8, -45],
    [27, -50], [17, -29], [35, -24], [16, -20], [2, -26], [-17, -17], [-31, -23],
    [-51, -22], [-28, -53], [-42, -51], [-19, -81], [-30, -78], [-11, -108], [-18, -105]], shade);
  line(c, [[-1, -136], [6, -119], [17, -107]], edge, 1.45);
  line(c, [[19, -79], [27, -68], [33, -62]], edge, 1.2);
  c.restore();
}

function moon(c, x, y) {
  halo(c, x, y, 204, '#b7caff63');
  const surface = c.createLinearGradient(x - 45, y - 82, x + 41, y + 73);
  surface.addColorStop(0, '#fcf2d4');
  surface.addColorStop(0.55, '#ede7d9');
  surface.addColorStop(1, '#b3b5d0');
  ellipse(c, x, y, 75, 75, surface, 0, '#ffffed', 1.7);
  for (const [dx, dy, rx, ry] of [[-30, -33, 16, 12], [24, -42, 14, 8], [31, 17, 21, 13],
    [-24, 24, 23, 16], [3, 47, 13, 9], [-47, 0, 10, 7], [13, -10, 8, 6], [48, -11, 8, 5]]) {
    ellipse(c, x + dx, y + dy, rx, ry, '#a4a4bd55', -0.54, '#fff5dc69', 1);
    ellipse(c, x + dx - 2, y + dy - 2, rx * 0.73, ry * 0.62, '#9b9cb845', -0.54);
  }
}

function woods(c, travel, time, details, sky) {
  gradient(c, [[0, '#17152f'], [0.45, '#29264e'], [0.76, '#4a426b'], [1, '#777398']]);
  const moonX = 1010 - Math.sin(travel / 3300) * 55;
  for (const [x, y, size, tone] of sky) {
    if (Math.hypot(x - moonX, y - 223) < 86) continue;
    const light = 0.56 + Math.sin(time * 1.4 + x) * 0.29;
    c.globalAlpha = light;
    if (tone > 0.93) sparkle(c, x, y, 4 + size * 5, '#e7e9ff');
    else ellipse(c, x, y, 0.7 + size * 1.1, 0.7 + size * 1.1, tone > 0.44 ? '#edecff' : '#b8bef3');
  }
  c.globalAlpha = 1;
  moon(c, moonX, 223);
  cloudBank(c, moonX - 133, 285, 310, 23, '#c5c0df4d');
  cloudBank(c, moonX + 192, 315, 280, 19, '#9998c043');
  ridge(c, 383, travel * 0.12, 64, 1064, '#49446b');
  ridge(c, 424, travel * 0.18 + 64, 48, 870, '#373657');
  for (let i = 0; i < 25; i++) {
    const x = wrap(i * 68 - travel * 0.22, 1700) - 120;
    pine(c, x, 473 + Math.sin(i * 1.22) * 29, 0.40 + i % 5 * 0.105, ['#3e4265', '#34384f', '#606184']);
  }
  ridge(c, 481, travel * 0.34, 37, 745, '#30334f');
  const mist = c.createLinearGradient(0, 387, 0, 538);
  mist.addColorStop(0, '#bdc1df00');
  mist.addColorStop(0.69, '#a6a4cb38');
  mist.addColorStop(1, '#b7c4ed00');
  c.fillStyle = mist;
  c.fillRect(0, 387, WIDTH, 151);
  for (let i = 0; i < 15; i++) {
    const x = wrap(i * 109 - travel * 0.55, 1635) - 160;
    pine(c, x, 534 + i % 4 * 8, 0.84 + i % 4 * 0.33, ['#302d46', '#24273e', '#504866']);
  }
  ridge(c, 553, travel * 0.62, 16, 757, '#292b43');
  for (const [offset, row, size, tone] of details) {
    const x = wrap(offset - travel * 0.82, 1510) - 85;
    if (tone > 0.69) {
      const y = 477 + row * 93 + 11 * Math.sin(time * 1.9 + offset);
      const glow = 0.55 + 0.35 * Math.sin(time * 3 + offset);
      c.globalAlpha = glow;
      halo(c, x, y, 11 + size * 8, '#ffdd7a8c');
      ellipse(c, x, y, 1.1 + size * 1.6, 1.1 + size * 1.3, '#ffe795');
      c.globalAlpha = 1;
    } else if (tone > 0.5) {
      const y = 557 + row * 19;
      polygon(c, [[x - 13 * size, y], [x - 8 * size, y - 8 * size], [x + 2 * size, y - 11 * size],
        [x + 10 * size, y - 6 * size], [x + 14 * size, y]], '#4a465d');
      line(c, [[x - 7 * size, y - 7 * size], [x + 2 * size, y - 10 * size], [x + 8 * size, y - 6 * size]], '#716886', 1);
    }
  }
  return woodsRoad;
}

function sunrise(c, time, details) {
  gradient(c, [[0, '#ddb3ab'], [0.33, '#f1ccaa'], [0.63, '#fff0bf'], [0.83, '#fff3c5'], [1, '#ecc48b']]);
  const sunX = 1003;
  const sunY = 366;
  halo(c, sunX, sunY, 347, '#fff5c6f5');
  for (let i = 0; i < 10; i++) {
    const angle = -2.95 + i * 0.30;
    const edge = angle + 0.085;
    polygon(c, [[sunX, sunY], [sunX + Math.cos(angle) * 870, sunY + Math.sin(angle) * 870],
      [sunX + Math.cos(edge) * 870, sunY + Math.sin(edge) * 870]], '#fff9d52e');
  }
  ellipse(c, sunX, sunY, 140, 140, '#fff7ca', 0, '#fffce6', 2.5);
  cloudBank(c, 832, 358, 389, 26, '#fff4d598');
  cloudBank(c, 1234, 271, 269, 25, '#fffbe06c');
  cloudBank(c, 403, 294, 285, 22, '#fff3da6b');

  ridge(c, 461, 159, 67, 860, '#c5ac94');
  ridge(c, 472, 212, 47, 1135, '#c2b28b');
  const mist = c.createLinearGradient(0, 392, 0, 522);
  mist.addColorStop(0, '#fff1c500');
  mist.addColorStop(0.53, '#fff2cbb3');
  mist.addColorStop(1, '#fff1c500');
  c.fillStyle = mist;
  c.fillRect(0, 392, WIDTH, 130);
  ridge(c, 513, 283, 33, 988, '#a8a57a');
  ridge(c, 549, 135, 23, 774, '#b8b084');
  for (let i = 0; i < 8; i++) {
    const x = i * 191 - 88;
    terrace(c, x, 550 + i % 2 * 9, 277, 40, '#e9cf9594', 2.4);
  }
  for (const [offset, row, size, tone] of details) {
    if (tone < 0.62) continue;
    const x = offset - 97;
    stalk(c, x, 558 + row * 20, 0.19 + size * 0.43, 0.12 + Math.sin(time * 2 + offset) * 0.08,
      '#8f8e61', tone > 0.85 ? '#f2d48b' : '#c0aa6b');
  }
  return dawnRoad;
}

export function createZoneScenery(seed) {
  const random = randomStream(seed ^ 0x9d07a3);
  const details = Array.from({ length: 144 }, () => [random() * 1510, random(), random(), random()]);
  // Paint the back rows of wheat before the foreground stalks.
  details.sort((a, b) => a[1] - b[1]);
  const sky = Array.from({ length: 135 }, () => [random() * WIDTH, 28 + random() * 370, random(), random()]);

  return (c, zone, travel, time, scene) => {
    if (scene === 'escaped') return sunrise(c, time, details);
    if (zone === 1) return harvest(c, travel, time, details);
    return woods(c, travel, time, details, sky);
  };
}
