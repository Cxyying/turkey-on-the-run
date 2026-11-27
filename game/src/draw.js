import { INK } from './config.js';

export function shape(c, color, path, outline = '', width = 2) {
  c.beginPath();
  path(c);
  if (color) {
    c.fillStyle = color;
    c.fill();
  }
  if (outline) {
    c.strokeStyle = outline;
    c.lineWidth = width;
    c.stroke();
  }
}

export function ellipse(c, x, y, rx, ry, color, angle = 0, outline = '', width = 2) {
  shape(c, color, p => p.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2), outline, width);
}

export function polygon(c, points, color, outline = '', width = 2) {
  shape(c, color, p => {
    p.moveTo(...points[0]);
    for (const point of points.slice(1)) p.lineTo(...point);
    p.closePath();
  }, outline, width);
}

export function line(c, points, color, width = 2) {
  shape(c, '', p => {
    p.moveTo(...points[0]);
    for (const point of points.slice(1)) p.lineTo(...point);
  }, color, width);
}

export function round(c, x, y, w, h, r, color, outline = '', width = 2) {
  shape(c, color, p => p.roundRect(x, y, w, h, r), outline, width);
}

export function label(c, value, x, y, font, color, align = 'left') {
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.font = font;
  c.fillStyle = color;
  c.fillText(value, x, y);
}

export function spaced(c, value, x, y, size, color, spacing = 3, align = 'left') {
  const font = `800 ${size}px system-ui, sans-serif`;
  c.font = font;
  const width = [...value].reduce((sum, char) => sum + c.measureText(char).width + spacing, -spacing);
  let left = align === 'center' ? x - width / 2 : x;
  for (const char of value) {
    label(c, char, left, y, font, color);
    left += c.measureText(char).width + spacing;
  }
}

export function sparkle(c, x, y, size, color) {
  polygon(c, [[x, y - size], [x + size * 0.23, y - size * 0.22], [x + size * 0.68, y],
    [x + size * 0.23, y + size * 0.22], [x, y + size], [x - size * 0.23, y + size * 0.22],
    [x - size * 0.68, y], [x - size * 0.23, y - size * 0.22]], color);
}

export function heart(c, x, y, size, filled) {
  c.save();
  c.translate(x, y);
  c.scale(size / 24, size / 24);
  shape(c, filled ? '#ee684f' : '#6e4140', p => {
    p.moveTo(0, 10);
    p.bezierCurveTo(-15, 0, -14, -10, -6, -10);
    p.quadraticCurveTo(-2, -10, 0, -6);
    p.quadraticCurveTo(2, -10, 6, -10);
    p.bezierCurveTo(14, -10, 15, 0, 0, 10);
    p.closePath();
  }, INK, 1.6);
  if (filled) line(c, [[-7, -6], [-9, -3]], '#ffd5a0', 2);
  c.restore();
}
