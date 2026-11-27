[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Cxyying/turkey-on-the-run/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Cxyying/turkey-on-the-run/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

# Turkey on the Run

**▶ Play it online: [cxyying.github.io/turkey-on-the-run/game](https://cxyying.github.io/turkey-on-the-run/game/)** — no install, runs right in your browser.

A side-scrolling Thanksgiving escape runner built for the make.fun turkey escape bounty. Run the farm road and reach the Freedom Gate at 1,200 m. The farmer falls back while you run clean. Each hit costs a heart and gives him a chance to close the gap. The run ends if he catches you or you run out of hearts.

Jump over hay bales, ovens, fences, and mud. Hold duck as carving knives fly past. Corn earns 5 points and golden corn earns 25.

## Controls

| Action | Controls |
| --- | --- |
| Start | Space, click, or tap |
| Jump | Space, W, ↑, click, or tap |
| Duck | Hold S, ↓, or the touch duck button |
| Pause or resume | P, or the pause control on touch |
| Restart after a run | R, click, or tap |
| Toggle sound | M or the speaker button |

## Run locally

From the repository root, run `node serve.ts` and open `http://localhost:8080` in a browser. Use Node.js 22 or newer. There is no build or install step.

## Tech notes

Vanilla ES modules draw the farm, characters, interface, and effects with Canvas 2D. Web Audio synthesizes the sound effects after a user gesture. The game uses no libraries, external assets, or external requests.

The simulation advances at 120 fixed steps per second. The seeded course generator accepts `?seed=N` and defaults to seed 1. The same seed and timed inputs reproduce a run. The four frozen competition views in `shots.json` accept `shot=start`, `shot=play`, `shot=end`, or `shot=win` alongside a seed. Each sets `window.__shotReady` after the frame is painted.
