import { HEIGHT, STEP, WIDTH } from './config.js';
import { createAudio } from './audio.js';
import { createRenderer, duckRegion, inRegion, muteRegion } from './render.js';
import { stageShot } from './shots.js';
import { createWorld, tick } from './world.js';

const canvas = document.querySelector('#game');
const status = document.querySelector('#status');
const mobile = document.querySelector('#mobile');
const pauseButton = document.querySelector('#pause');
const context = canvas.getContext('2d');
const query = new URLSearchParams(location.search);
const seed = query.has('seed') && Number.isFinite(Number(query.get('seed'))) ? Number(query.get('seed')) >>> 0 : 1;
const shot = query.get('shot');
const render = createRenderer(context, seed);
const audio = createAudio();
const coarsePointer = matchMedia('(pointer: coarse)');
const duckKeys = new Set(['ArrowDown', 'KeyS']);
const jumpKeys = new Set(['ArrowUp', 'Space', 'KeyW']);
const duckPointers = new Set();
const held = new Set();
const pointer = { x: -1, y: -1 };
let world = createWorld(seed);
let screen = 'title';
let muted = false;
let jump = false;
let lastTime = null;
let accumulator = 0;
let touch = coarsePointer.matches;
let endAge = 0;

function resize() {
  const box = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(box.width * ratio));
  canvas.height = Math.max(1, Math.round(box.height * ratio));
  context.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

function announce(text) {
  status.textContent = text;
}

function draw(pose, isShot = false) {
  render(world, screen, pose, { muted, touch: !isShot && touch, ...pointer });
}

function setScreen(next) {
  screen = next;
  audio.setMusic(next === 'playing');
  jump = false;
  accumulator = 0;
  duckPointers.clear();
  endAge = 0;
  mobile.hidden = next !== 'playing' && next !== 'paused';
  pauseButton.textContent = next === 'paused' ? 'Resume' : 'Pause';
  if (next === 'title') announce('Turkey on the Run. Press Space or click to run. Space, W, or Up to jump. Hold S or Down to duck. P pauses and M toggles sound.');
  if (next === 'playing') announce('Running. Reach the Freedom Gate at 1,200 meters.');
  if (next === 'paused') announce('Paused. Press P or click to resume.');
  if (next === 'caught' || next === 'escaped') {
    const result = next === 'escaped' ? 'You escaped! Free bird!' : 'Caught! Dinner time.';
    announce(`${result} Score ${world.score}. Distance ${Math.floor(world.distance)} meters. ` +
      `${world.cornCollected} corn, best combo ${world.bestCombo}, ${world.nearMisses} near misses, ` +
      `${Math.floor(world.time)} seconds. Press R or click to run again.`);
  }
}

function start() {
  world = createWorld(seed);
  setScreen('playing');
}

function togglePause() {
  if (screen === 'playing' || screen === 'paused') setScreen(screen === 'playing' ? 'paused' : 'playing');
}

function toggleMute() {
  muted = audio.mute();
  if (!muted) audio.unlock();
  announce(muted ? 'Sound muted.' : 'Sound on.');
}

function position(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = (event.clientX - rect.left) / rect.width * WIDTH;
  pointer.y = (event.clientY - rect.top) / rect.height * HEIGHT;
}

function keydown(event) {
  const code = event.code;
  if (event.target instanceof HTMLButtonElement && (code === 'Space' || code === 'Enter')) return;
  if (!jumpKeys.has(code) && !duckKeys.has(code) && !['KeyP', 'KeyR', 'KeyM', 'Enter'].includes(code)) return;
  event.preventDefault();
  if (event.repeat) return;
  audio.unlock();
  if (duckKeys.has(code)) held.add(code);
  if (code === 'KeyM') toggleMute();
  else if (code === 'KeyP') togglePause();
  else if (screen === 'title' && (jumpKeys.has(code) || code === 'Enter')) start();
  else if (code === 'KeyR' && screen !== 'title') start();
  else if ((screen === 'caught' || screen === 'escaped') && code === 'Enter') start();
  else if (screen === 'playing' && jumpKeys.has(code)) jump = true;
}

function pointerdown(event) {
  if (event.button !== 0) return;
  position(event);
  if (event.pointerType === 'touch') touch = true;
  audio.unlock();
  if (inRegion(pointer.x, pointer.y, muteRegion)) {
    toggleMute();
  } else if (screen === 'title' || screen === 'caught' || screen === 'escaped') {
    start();
  } else if (screen === 'paused' || (touch && inRegion(pointer.x, pointer.y, [157, 639, 97, 47]))) {
    togglePause();
  } else if (touch && inRegion(pointer.x, pointer.y, duckRegion)) {
    holdDuck(event);
  } else {
    jump = true;
  }
}

function holdDuck(event) {
  if (event.button !== 0 || screen !== 'playing') return;
  duckPointers.add(event.pointerId);
  event.currentTarget.setPointerCapture(event.pointerId);
}

function releaseDuck(event) {
  duckPointers.delete(event.pointerId);
}

function action(type) {
  audio.play(type);
  if (type === 'hit') announce(`Stumbled! ${world.lives} ${world.lives === 1 ? 'life' : 'lives'} left.`);
  if (type === 'feather') announce('Golden feather collected. Shield ready.');
  if (type === 'shield') announce('Shield absorbed the impact.');
  if (type === 'frenzy') announce('Corn frenzy. Double points for five seconds.');
}

function frame(now) {
  const elapsed = lastTime === null ? 0 : Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  if (screen === 'playing') {
    audio.update();
    accumulator += elapsed;
    while (accumulator >= STEP && !world.result) {
      tick(world, { jump, duck: held.size > 0 || duckPointers.size > 0 }, action);
      accumulator -= STEP;
      jump = false;
    }
    if (world.result) setScreen(world.result);
  }
  endAge += elapsed;
  const pose = screen === 'title' ? 0.68 + endAge
    : screen === 'escaped' || screen === 'caught' ? world.time + endAge : world.time;
  draw(pose);
  requestAnimationFrame(frame);
}

resize();
if (['start', 'play', 'end', 'win'].includes(shot)) {
  document.body.dataset.shot = shot;
  const still = stageShot(shot, seed);
  world = still.world;
  setScreen(still.screen);
  const paint = () => draw(still.pose, true);
  window.addEventListener('resize', () => { resize(); paint(); });
  requestAnimationFrame(() => {
    paint();
    requestAnimationFrame(() => {
      paint();
      window.__shotReady = true;
    });
  });
} else {
  setScreen('title');
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', event => held.delete(event.code));
  window.addEventListener('blur', () => {
    held.clear();
    duckPointers.clear();
    if (screen === 'playing') setScreen('paused');
  });
  canvas.addEventListener('pointerdown', pointerdown);
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') position(event);
  });
  canvas.addEventListener('pointerleave', () => { pointer.x = -1; });
  window.addEventListener('pointerup', releaseDuck);
  window.addEventListener('pointercancel', releaseDuck);
  window.addEventListener('lostpointercapture', releaseDuck);
  document.querySelector('#duck').addEventListener('pointerdown', holdDuck);
  document.querySelector('#jump').addEventListener('click', () => { if (screen === 'playing') jump = true; });
  pauseButton.addEventListener('click', togglePause);
  requestAnimationFrame(frame);
}
