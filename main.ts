import { cpSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier, readGameTree } from './vendor/makefun-game.ts';

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function validateScreenshots(sourceDir: string, screenshotsDir: string) {
  let shots: unknown;
  try {
    shots = JSON.parse(readFileSync(join(sourceDir, 'shots.json'), 'utf8'));
  } catch (error) {
    throw new Error('Could not read shots.json as JSON.', { cause: error });
  }

  const { max, max_bytes: maxBytes } = caps.screenshots;
  if (!Array.isArray(shots) || shots.length !== max) {
    throw new Error(`shots.json must list exactly ${max} screenshots.`);
  }

  const names = new Set<string>();
  for (const shot of shots) {
    if (typeof shot?.name !== 'string' || shot.name.length === 0) {
      throw new Error('Each entry in shots.json must have a screenshot name.');
    }
    if (names.has(shot.name)) {
      throw new Error(`Duplicate screenshot in shots.json: ${shot.name}`);
    }
    names.add(shot.name);
  }

  const entries = new Set(readdirSync(screenshotsDir));
  const screenshots = Array.from(names, (name) => {
    if (!entries.delete(name)) {
      throw new Error(`Missing screenshot listed in shots.json: screenshots/${name}`);
    }
    const file = lstatSync(join(screenshotsDir, name));
    if (!file.isFile()) {
      throw new Error(`screenshots/${name} must be a regular file.`);
    }
    if (file.size > maxBytes) {
      throw new Error(`screenshots/${name} is ${file.size} bytes and exceeds the ${maxBytes}-byte limit.`);
    }
    return { name, bytes: file.size };
  });

  if (entries.size > 0) {
    throw new Error(`Unexpected entries in screenshots/: ${[...entries].sort().join(', ')}`);
  }
  return screenshots;
}

function main() {
  const sourceDir = fileURLToPath(new URL('.', import.meta.url));
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const gameDir = join(sourceDir, 'game');
  const screenshotsDir = join(sourceDir, 'screenshots');

  if (!lstatSync(join(gameDir, 'index.html'), { throwIfNoEntry: false })?.isFile()) {
    throw new Error('game/index.html is required and must be a regular file.');
  }
  const screenshots = validateScreenshots(sourceDir, screenshotsDir);
  const { files } = readGameTree(gameDir, caps);

  mkdirSync(outputDir, { recursive: true });
  cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
  cpSync(screenshotsDir, join(outputDir, 'screenshots'), { recursive: true });

  const dossier = buildDossier(outputDir, caps);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);

  console.log([
    'Turkey on the Run',
    `Game files copied: ${files.length}`,
    ...screenshots.map(({ name, bytes }) => `${name}: ${bytes} bytes`),
    `dossier.json: ${dossier.byteLength} bytes`,
  ].join('\n'));
}

main();
