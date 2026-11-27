import { INK } from './config.js';
import { ellipse, line, polygon, round, shape } from './draw.js';

function feather(c, x, y, angle, length, width, colors) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  const [base, tip, band, shaft] = colors;
  shape(c, base, p => {
    p.moveTo(-1, 2);
    p.bezierCurveTo(-width * 0.52, -length * 0.2, -width, -length * 0.72, -width * 0.75, -length * 0.89);
    p.bezierCurveTo(-width * 0.51, -length * 1.05, width * 0.65, -length * 1.06, width * 0.81, -length * 0.86);
    p.bezierCurveTo(width, -length * 0.66, width * 0.51, -length * 0.2, 1, 2);
    p.closePath();
  }, INK, 1.8);
  shape(c, tip, p => {
    p.moveTo(-width * 0.79, -length * 0.72);
    p.bezierCurveTo(-width, -length * 1.09, width * 1.03, -length * 1.09, width * 0.83, -length * 0.75);
    p.quadraticCurveTo(0, -length * 0.61, -width * 0.79, -length * 0.72);
  });
  shape(c, '', p => {
    p.moveTo(-width * 0.78, -length * 0.67);
    p.quadraticCurveTo(-2, -length * 0.58, width * 0.79, -length * 0.69);
  }, band, 3);
  line(c, [[0, -5], [-1, -length * 0.87]], shaft, 1);
  for (let i = 1; i <= 3; i++) {
    const edge = -length * (0.22 + i * 0.088);
    line(c, [[-1, edge + 6], [-width * (0.23 + i * 0.12), edge]], shaft, 0.9);
  }
  c.restore();
}

function turkeyLeg(c, x, knee, foot, shade) {
  const [fx, fy] = foot;
  const points = [[x, -21], knee, foot];
  line(c, points, INK, 5);
  line(c, points, shade, 2.8);
  const toes = [[fx - 6, fy + 3], [fx, fy], [fx + 7, fy + 1], [fx + 13, fy + 5]];
  line(c, toes, INK, 4.1);
  line(c, toes, shade, 2.2);
  line(c, [[fx + 2, fy + 1], [fx + 7, fy + 6]], shade, 2.1);
}

export function turkey(c, x, y, { scale = 1, stride = 0, duck = false, air = false, mood = '' } = {}) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  const bob = duck || air ? 0 : -Math.abs(Math.sin(stride)) * 4;
  if (duck) {
    c.translate(5, -1);
    c.scale(1.07, 0.59);
  }
  if (air) c.rotate(-0.10);
  if (mood === 'caught') c.rotate(0.052);

  const strideLength = duck ? 13 : 23;
  for (const [phase, shade] of [[stride + Math.PI, '#d4864b'], [stride, '#ffba5a']]) {
    const swing = Math.sin(phase);
    const step = mood === 'caught' ? 0 : swing * strideLength;
    const lift = mood === 'caught' ? 0 : air ? 13 : Math.max(0, Math.cos(phase)) * 12;
    turkeyLeg(c, shade === '#ffba5a' ? 3 : -12, [step * 0.45 - 4, -11 - lift * 0.55],
      [step, -6 - lift], shade);
  }

  c.translate(0, bob);
  c.save();
  c.translate(-18, -32);
  c.rotate(Math.sin(stride * 0.74) * 0.05 - (duck ? 0.22 : 0));
  const red = ['#87403d', '#ba4f3b', '#f9a858', '#d36b51'];
  const cherry = ['#7e3540', '#a84644', '#ec8250', '#c96559'];
  const ochre = ['#9b4835', '#d86a3c', '#ffc064', '#e28950'];
  feather(c, 0, 0, -1.38, 62, 13, cherry);
  feather(c, 0, 0, -1.12, 76, 14, red);
  feather(c, 0, 0, -0.84, 85, 14, ochre);
  feather(c, 0, 0, -0.55, 86, 15, red);
  feather(c, 0, 0, -0.24, 76, 13, ochre);
  feather(c, 0, 0, 0.078, 63, 12, cherry);
  c.restore();

  const body = c.createLinearGradient(0, -62, 0, -10);
  body.addColorStop(0, '#b76345');
  body.addColorStop(0.52, '#914734');
  body.addColorStop(1, '#663033');
  ellipse(c, 0, -34, 38, 25, body, -0.17, INK, 2.2);
  shape(c, '#b67051', p => {
    p.moveTo(11, -23);
    p.bezierCurveTo(21, -29, 20, -46, 21, -58);
    p.bezierCurveTo(21, -76, 37, -83, 49, -73);
    p.bezierCurveTo(58, -64, 53, -53, 44, -47);
    p.bezierCurveTo(42, -34, 33, -16, 11, -23);
    p.closePath();
  }, INK, 2.1);
  shape(c, '#e06450', p => {
    p.moveTo(32, -64);
    p.bezierCurveTo(33, -78, 43, -82, 51, -74);
    p.bezierCurveTo(59, -66, 55, -54, 48, -49);
    p.bezierCurveTo(52, -40, 48, -34, 42, -38);
    p.bezierCurveTo(36, -42, 42, -53, 40, -56);
    p.closePath();
  }, '#813840', 1.35);
  polygon(c, [[53, -67], [67, -59], [56, -54], [51, -59]], '#ffc568', INK, 1.8);
  line(c, [[55, -58], [64, -59]], '#ab6437', 1.15);
  ellipse(c, 45, -66, 7.4, 8.8, '#fff2d0', -0.2, '#7b3c38', 1);
  ellipse(c, mood === 'caught' ? 44 : 48, -65, 3.2, 4.5, '#332229', -0.09);
  ellipse(c, mood === 'caught' ? 44.8 : 49, -67, 1.1, 1.3, '#fff6de');
  if (mood === 'caught') line(c, [[38, -77], [50, -73]], INK, 2);
  else line(c, [[39, -76], [45, -78], [51, -75]], '#673035', 1.8);
  line(c, [[34, -81], [36, -85], [41, -79], [43, -86], [47, -80]], '#9c453a', 2);
  ellipse(c, 38, -55, 3.5, 2.1, '#f9906a', -0.25);

  c.save();
  c.translate(8, -39);
  c.rotate(0.15 + (air ? 0.22 : 0.1) * Math.sin(stride * 1.53));
  shape(c, '#964e3e', p => {
    p.moveTo(14, -2);
    p.bezierCurveTo(7, 21, -23, 22, -40, 3);
    p.bezierCurveTo(-34, 2, -27, -17, -7, -15);
    p.bezierCurveTo(6, -15, 13, -11, 14, -2);
  }, '#613336', 1.8);
  for (let i = 0; i < 4; i++) {
    shape(c, '', p => {
      p.moveTo(6 - 4 * i, -5 + i * 4.4);
      p.quadraticCurveTo(-4 - 6 * i, 5 + i * 3.8, -22 - 3 * i, -1 + i * 2.8);
    }, i === 0 ? '#dc9766' : '#ce8159', 1.45);
  }
  c.restore();
  c.restore();
}

function boot(c, kneeX, kneeY, ankleX, ankleY, color) {
  line(c, [[-5, -44], [kneeX, kneeY], [ankleX, ankleY]], INK, 15);
  line(c, [[-5, -44], [kneeX, kneeY], [ankleX, ankleY]], color, 10.5);
  shape(c, '#573435', p => {
    p.moveTo(ankleX - 7, ankleY - 4);
    p.lineTo(ankleX + 5, ankleY - 3);
    p.quadraticCurveTo(ankleX + 18, ankleY - 1, ankleX + 18, ankleY + 6);
    p.lineTo(ankleX - 9, ankleY + 6);
    p.closePath();
  }, INK, 2);
  line(c, [[ankleX - 7, ankleY + 4], [ankleX + 16, ankleY + 4]], '#ac6c5b', 1.2);
}

export function farmer(c, x, y, { scale = 1, stride = 0, stopped = false } = {}) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  const swing = stopped ? 0 : Math.sin(stride);
  const backLift = stopped ? 0 : Math.max(0, -Math.cos(stride)) * 13;
  const frontLift = stopped ? 0 : Math.max(0, Math.cos(stride)) * 13;
  boot(c, -7 - swing * 13, -23 - backLift * 0.5, -5 - swing * 25, -7 - backLift, '#436063');
  boot(c, 2 + swing * 14, -24 - frontLift * 0.5, 2 + swing * 26, -7 - frontLift, '#64827b');

  c.translate(0, stopped ? 0 : -Math.abs(swing) * 5);
  const arm = [[-6, -70], [9 + swing * 11, -56], [28 + swing * 14, -73]];
  line(c, arm, INK, 13);
  line(c, arm, '#a95748', 9);

  shape(c, '#d37858', p => {
    p.moveTo(-23, -49);
    p.bezierCurveTo(-26, -58, -20, -80, -7, -84);
    p.bezierCurveTo(6, -89, 20, -74, 19, -62);
    p.lineTo(13, -42);
    p.closePath();
  }, INK, 2.3);
  shape(c, '#52746d', p => {
    p.moveTo(-22, -46);
    p.lineTo(-14, -80);
    p.lineTo(-7, -81);
    p.lineTo(-11, -64);
    p.lineTo(8, -61);
    p.lineTo(12, -76);
    p.lineTo(18, -71);
    p.lineTo(17, -52);
    p.lineTo(12, -38);
    p.quadraticCurveTo(-8, -35, -22, -46);
    p.closePath();
  }, INK, 2);
  ellipse(c, -9, -64, 2.3, 2.3, '#edb861');
  ellipse(c, 12, -61, 2.3, 2.3, '#edb861');
  shape(c, '#668981', p => {
    p.moveTo(-8, -55);
    p.lineTo(7, -53);
    p.lineTo(5, -45);
    p.quadraticCurveTo(-4, -41, -9, -48);
    p.closePath();
  }, '#345a59', 1.2);

  shape(c, '#eaaa7b', p => {
    p.moveTo(-14, -96);
    p.bezierCurveTo(-14, -115, 17, -117, 23, -104);
    p.lineTo(25, -95);
    p.quadraticCurveTo(38, -92, 31, -87);
    p.lineTo(22, -87);
    p.quadraticCurveTo(25, -75, 8, -77);
    p.quadraticCurveTo(-11, -77, -14, -96);
    p.closePath();
  }, INK, 2);
  shape(c, '#663c37', p => {
    p.moveTo(10, -85);
    p.quadraticCurveTo(17, -94, 26, -88);
    p.quadraticCurveTo(31, -82, 35, -86);
    p.quadraticCurveTo(30, -77, 20, -82);
    p.quadraticCurveTo(14, -80, 10, -85);
  }, INK, 1.5);
  ellipse(c, 20, -98, 3.7, 4.1, '#fff1ce');
  ellipse(c, 21.4, -97.8, 1.9, 3, INK);
  line(c, [[14, -103], [23, -101]], INK, 2);
  ellipse(c, -9, -93, 5.1, 6.1, '#efae82', 0.15, '#8a4a3b', 1.2);
  line(c, [[-11, -95], [-8, -96], [-7, -93]], '#a66551', 1.2);

  c.save();
  c.translate(-2, -109);
  c.rotate(0.13);
  ellipse(c, 1, 0, 34, 8, '#d8914e', 0, INK, 2);
  shape(c, '#eeae61', p => {
    p.moveTo(-20, -1);
    p.lineTo(-15, -21);
    p.quadraticCurveTo(-10, -27, -4, -23);
    p.quadraticCurveTo(2, -19, 8, -21);
    p.quadraticCurveTo(14, -24, 18, -17);
    p.lineTo(22, -2);
    p.quadraticCurveTo(1, 3, -20, -1);
    p.closePath();
  }, INK, 2);
  shape(c, '#974740', p => {
    p.moveTo(-19, -7);
    p.quadraticCurveTo(1, -2, 20, -8);
    p.lineTo(22, -2);
    p.quadraticCurveTo(1, 4, -20, -1);
    p.closePath();
  });
  line(c, [[-11, -20], [-5, -21], [2, -18]], '#ffe0a0', 1.8);
  c.restore();

  const handX = 21 - swing * 13;
  const handY = -64 + swing * 8;
  const nearArm = [[-14, -70], [-12 - swing * 10, -55], [handX, handY]];
  line(c, nearArm, INK, 14);
  line(c, nearArm, '#db805e', 10);
  line(c, [[-13, -69], [-11 - swing * 10, -57]], '#f5a271', 2);

  c.save();
  c.translate(handX, handY);
  c.rotate(-0.38 + swing * 0.25);
  round(c, -4, -3, 9, 35, 3, '#884a3c', INK, 2);
  line(c, [[1, 1], [1, -37]], INK, 5);
  line(c, [[1, 1], [1, -37]], '#b8c5b6', 2.7);
  shape(c, '', p => {
    p.moveTo(-8, -61);
    p.quadraticCurveTo(-11, -39, 0, -38);
    p.quadraticCurveTo(11, -38, 10, -61);
  }, INK, 5);
  shape(c, '', p => {
    p.moveTo(-8, -61);
    p.quadraticCurveTo(-11, -39, 0, -38);
    p.quadraticCurveTo(11, -38, 10, -61);
    p.moveTo(1, -40);
    p.lineTo(1, -64);
  }, '#d5dac2', 2.7);
  ellipse(c, 0, 0, 7.9, 6.7, '#f0b188', -0.15, INK, 1.7);
  c.restore();
  c.restore();
}
