import { CREAM, INK } from './config.js';
import { ellipse, label, line, polygon, round, shape, spaced, sparkle } from './draw.js';

export function shadow(c, x, y, width, opacity = 0.25) {
  ellipse(c, x, y + 3, width, 7, `rgba(74, 35, 29, ${opacity})`);
}

function oven(c) {
  shadow(c, 0, 0, 43);
  round(c, -28, -12, 10, 12, 2, '#493635', INK, 2);
  round(c, 19, -12, 10, 12, 2, '#493635', INK, 2);
  round(c, -36, -67, 72, 59, 6, '#59736d', INK, 2.8);
  round(c, -37, -71, 74, 17, 5, '#e7bb79', INK, 2.6);
  line(c, [[-30, -68], [29, -68]], '#ffe6ad', 1.4);
  for (const x of [-23, -8, 8, 23]) {
    ellipse(c, x, -62, 4, 4, '#754a42');
    line(c, [[x - 0.7, -64], [x + 1, -62]], '#e7ad72', 1.3);
  }
  round(c, -27, -48, 54, 32, 5, '#593637', INK, 2);
  round(c, -22, -43, 44, 22, 4, '#a54f38');
  shape(c, '#ed8944', p => {
    p.moveTo(-18, -22);
    p.quadraticCurveTo(-22, -31, -12, -34);
    p.quadraticCurveTo(-10, -29, -8, -30);
    p.quadraticCurveTo(-3, -34, 0, -40);
    p.quadraticCurveTo(6, -36, 5, -29);
    p.quadraticCurveTo(10, -34, 14, -33);
    p.quadraticCurveTo(21, -27, 17, -22);
  });
  line(c, [[-16, -48], [16, -48]], '#ffdc9b', 3.2);
  line(c, [[-29, -14], [29, -14]], '#9aab8f', 1.5);
}

function ovenEmbers(c, pose) {
  for (let i = 0; i < 6; i++) {
    const rise = (pose * (25 + i * 2) + i * 10) % 42;
    const x = (i - 2.5) * 9 + Math.sin(pose * 4 + i) * 6;
    sparkle(c, x, -72 - rise, (1 - rise / 42) * (3 + i % 3), i % 2 ? '#fff3b0' : '#e57d41');
  }
}

function bale(c) {
  shadow(c, 0, 0, 41);
  round(c, -34, -52, 69, 51, 10, '#e8a84e', INK, 2.7);
  shape(c, '#c98637', p => {
    p.moveTo(-33, -16);
    p.quadraticCurveTo(0, -8, 34, -19);
    p.lineTo(34, -9);
    p.quadraticCurveTo(31, -2, 24, -2);
    p.lineTo(-25, -2);
    p.quadraticCurveTo(-33, -2, -33, -16);
  });
  line(c, [[-27, -47], [-10, -49], [10, -47], [28, -48]], '#ffce75', 2);
  for (let i = 0; i < 27; i++) {
    const x = ((i * 37) % 65) - 33;
    const y = -45 + (i * 19) % 38;
    line(c, [[x, y], [Math.min(34, x + 5 + i % 11), y - 2 + i % 5]], i % 2 ? '#f9c66a' : '#b77b36', 1.5);
  }
  for (const x of [-15, 16]) {
    shape(c, '', p => {
      p.moveTo(x, -52);
      p.bezierCurveTo(x - 3, -40, x + 2, -12, x, -1);
    }, '#895438', 2.3);
    ellipse(c, x + 1, -38, 4, 2.7, '#a36338', 0.3);
  }
  for (const [x, y, dx] of [[-31, -39, -9], [-32, -12, -8], [32, -17, 8], [30, -45, 8], [18, -3, 13]]) {
    line(c, [[x, y], [x + dx, y - 5]], '#efb653', 2);
  }
}

function hurdle(c) {
  shadow(c, 0, 0, 42);
  for (const x of [-23, 26]) {
    polygon(c, [[x - 6, 0], [x - 7, -53], [x, -63], [x + 6, -54], [x + 6, -1]], '#b7724c', INK, 2.4);
    line(c, [[x - 2, -4], [x - 3, -54], [x, -59]], '#edbd7a', 2);
  }
  polygon(c, [[-31, -45], [32, -39], [33, -30], [-32, -34]], '#ebbc7e', INK, 2);
  polygon(c, [[-31, -20], [31, -16], [32, -7], [-32, -10]], '#d39b64', INK, 2);
  line(c, [[-20, -38], [0, -37], [16, -34]], '#bd8153', 1.4);
  ellipse(c, -24, -39, 2, 2, INK);
  ellipse(c, 25, -35, 2, 2, INK);
  ellipse(c, -24, -15, 2, 2, INK);
  ellipse(c, 25, -12, 2, 2, INK);
}

function mud(c) {
  shape(c, '#804b3f', p => {
    p.moveTo(-54, -1);
    p.bezierCurveTo(-62, -6, -39, -7, -29, -8);
    p.bezierCurveTo(-26, -15, 13, -13, 21, -8);
    p.bezierCurveTo(49, -10, 64, -2, 53, 2);
    p.bezierCurveTo(45, 6, 22, 8, -1, 6);
    p.bezierCurveTo(-23, 10, -45, 6, -54, -1);
  }, '#633d38', 1.6);
  ellipse(c, -12, -4, 26, 3.4, '#aa7060', -0.025);
  line(c, [[-27, -3], [-10, -3]], '#d99876', 1.5);
  line(c, [[22, 0], [37, -1], [40, 0]], '#bf8469', 1.4);
  ellipse(c, -43, 7, 8, 1.5, '#744239');
  ellipse(c, 49, 7, 5, 1.7, '#744239');
}

function knife(c, pose) {
  line(c, [[26, -8], [69, -8]], '#fff2ceba', 2);
  line(c, [[39, 1], [90, 1]], '#fff2ce9c', 2);
  line(c, [[36, 10], [62, 10]], '#a9634aa0', 1.8);
  c.save();
  c.rotate(Math.sin(pose * 13) * 0.065 - 0.035);
  const metal = c.createLinearGradient(0, -10, 0, 11);
  metal.addColorStop(0, '#9ba9a3');
  metal.addColorStop(0.49, '#d9e1ce');
  metal.addColorStop(0.52, '#f7f0d4');
  metal.addColorStop(1, '#e8dab8');
  shape(c, metal, p => {
    p.moveTo(-41, -1);
    p.quadraticCurveTo(-27, -13, 7, -9);
    p.lineTo(13, -8);
    p.lineTo(13, 9);
    p.quadraticCurveTo(-21, 12, -41, -1);
    p.closePath();
  }, INK, 2.2);
  line(c, [[-33, 0], [-14, 5], [8, 5]], '#fff9e0', 1.5);
  round(c, 9, -7, 30, 13, 4, '#783d3c', INK, 2);
  line(c, [[15, -4], [33, -4]], '#c77555', 1.4);
  for (const x of [17, 29]) ellipse(c, x, -0.5, 1.6, 1.6, '#f9c378');
  c.restore();
  sparkle(c, -22, -9, 5 + 2 * Math.sin(pose * 7), '#fff8e2');
}

function pumpkin(c, turns) {
  shadow(c, 0, 0, 34);
  c.save();
  c.translate(0, -29);
  c.rotate(turns);
  const skin = c.createLinearGradient(-13, -29, 18, 27);
  skin.addColorStop(0, '#ffd16b');
  skin.addColorStop(0.47, '#ed8837');
  skin.addColorStop(1, '#b44732');
  ellipse(c, 0, 0, 30, 26, '#d55a2e', 0, INK, 2.5);
  ellipse(c, -13, 0, 16, 25, skin, 0.12, '#a84b2c', 1.8);
  ellipse(c, 13, 0, 16, 25, skin, -0.12, '#a84b2c', 1.8);
  ellipse(c, 0, 0, 13, 26, skin, 0.02, '#bd542b', 1.5);
  shape(c, '#71804c', p => {
    p.moveTo(-5, -24);
    p.quadraticCurveTo(1, -31, -2, -36);
    p.lineTo(4, -37);
    p.quadraticCurveTo(10, -31, 4, -24);
    p.closePath();
  }, INK, 1.7);
  shape(c, '', p => {
    p.moveTo(-4, -20);
    p.quadraticCurveTo(-11, -11, -8, -3);
  }, '#ffe593', 2.4);
  c.restore();
}

export function corn(c, x, y, gold, pose, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  if (gold) {
    const glow = c.createRadialGradient(0, 0, 3, 0, 0, 32);
    glow.addColorStop(0, '#fff2a8b0');
    glow.addColorStop(1, '#fff2a800');
    ellipse(c, 0, 0, 32, 32, glow);
    sparkle(c, -17, -11, 7 + 2 * Math.sin(pose * 5), '#fff8d7');
    sparkle(c, 17, 8, 5, '#fff8d7');
  }
  c.rotate(0.43 + Math.sin(pose * 4) * 0.12);
  ellipse(c, 0, -1, 9.4, 14, gold ? '#ffcc4f' : '#f5ac41', 0, '#774436', 1.65);
  for (const [row, cols] of [[-10, 2], [-5, 3], [0, 3], [5, 3], [9, 2]]) {
    for (let i = 0; i < cols; i++) {
      const x = (i - (cols - 1) / 2) * 4.6;
      round(c, x - 1.8, row - 1.5, 3.8, 3.5, 1.3, gold || i === 0 ? '#fff294' : '#ffd266');
    }
  }
  shape(c, gold ? '#ed9c49' : '#6f8b60', p => {
    p.moveTo(-2, 13);
    p.quadraticCurveTo(-13, 9, -13, -2);
    p.quadraticCurveTo(-7, 0, -4, 6);
    p.quadraticCurveTo(2, 5, 12, -3);
    p.quadraticCurveTo(12, 9, 3, 14);
    p.closePath();
  }, '#754b38', 1.3);
  line(c, [[3, 10], [9, 4]], gold ? '#fff18c' : '#abc488', 1.1);
  c.restore();
}

export function goldenFeather(c, x, y, pose, scale = 1, glow = true) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  if (glow) {
    const light = c.createRadialGradient(0, 0, 2, 0, 0, 38);
    light.addColorStop(0, '#fff4a4dd');
    light.addColorStop(1, '#fff4a400');
    ellipse(c, 0, 0, 38, 38, light);
    sparkle(c, -22, 0, 5 + Math.sin(pose * 5) * 2, '#fff5c6');
    sparkle(c, 20, -13, 7, '#fff5c6');
  }
  c.rotate(0.57 + Math.sin(pose * 3) * 0.13);
  shape(c, '#ffc453', p => {
    p.moveTo(0, 16);
    p.bezierCurveTo(-13, 6, -16, -16, 0, -24);
    p.bezierCurveTo(11, -22, 18, -4, 5, 7);
    p.lineTo(8, 8);
    p.quadraticCurveTo(5, 14, 0, 16);
    p.closePath();
  }, '#875034', 2);
  shape(c, '#ffe89a', p => {
    p.moveTo(0, 10);
    p.quadraticCurveTo(-11, -1, -8, -11);
    p.quadraticCurveTo(-5, -19, 0, -21);
    p.quadraticCurveTo(-1, -9, 0, 10);
  });
  line(c, [[-2, 21], [0, 3], [0, -17]], '#a46731', 1.7);
  for (let i = 0; i < 3; i++) line(c, [[1, -6 + i * 6], [7, -13 + i * 7]], '#fff1b1', 1.6);
  c.restore();
}

export function prop(c, kind, x, y, pose, turns = 0) {
  c.save();
  c.translate(x, y);
  if (kind === 'oven') {
    ovenEmbers(c, pose);
    oven(c);
  }
  if (kind === 'hay') bale(c);
  if (kind === 'fence') hurdle(c);
  if (kind === 'mud') mud(c);
  if (kind === 'knife') knife(c, pose);
  if (kind === 'pumpkin') pumpkin(c, turns);
  c.restore();
}

export function gate(c, x, y, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  shadow(c, 0, 0, 125, 0.31);
  for (const side of [-1, 1]) {
    const px = side * 86;
    polygon(c, [[px - 9, 0], [px - 10, -154], [px + 7, -155], [px + 9, -1]], '#825041', INK, 3);
    line(c, [[px - 5, -7], [px - 5, -147]], '#d8a570', 2.5);
    polygon(c, [[px - 16, -151], [px - 16, -159], [px, -174], [px + 16, -160], [px + 16, -151]],
      '#d79959', INK, 3);
    for (let i = 0; i < 4; i++) {
      const dx = px + side * 11 * i;
      const lift = 50 - i * 6;
      round(c, dx - 4, -lift - 13, 8, lift + 10, 2, '#bb8559', INK, 1.4);
    }
    line(c, [[px, -34], [px + side * 36, -17]], INK, 5);
    line(c, [[px, -35], [px + side * 36, -18]], '#d9a56d', 3);
  }
  shape(c, '#345b50', p => {
    p.moveTo(-105, -153);
    p.quadraticCurveTo(0, -195, 105, -153);
    p.lineTo(101, -121);
    p.quadraticCurveTo(0, -153, -101, -121);
    p.closePath();
  }, INK, 3);
  shape(c, '', p => {
    p.moveTo(-98, -150);
    p.quadraticCurveTo(0, -187, 98, -150);
  }, '#82a27e', 1.5);
  spaced(c, 'FREEDOM', 0, -150, 20, CREAM, 2.4, 'center');
  label(c, 'GATE', 0, -136, '800 11px system-ui, sans-serif', '#fed27e', 'center');
  sparkle(c, -76, -144, 6, '#ffd280');
  sparkle(c, 76, -144, 6, '#ffd280');
  c.restore();
}
