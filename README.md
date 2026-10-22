# PixiJS Vault Game

A vault-cracking mini game built with [PixiJS v8](https://github.com/pixijs/pixijs), [GSAP](https://gsap.com) and [Vite](https://vitejs.dev). Spin the golden wheel to enter the secret code, crack the safe and watch the treasure light up.

Based on [DreamShotTask/pixi-minimal](https://github.com/DreamShotTask/pixi-minimal).

## How to play

1. Open the browser **console**. Every new round logs the secret code there:

   ```
   🔐 Secret combination: 2 CW, 7 CCW, 5 CW
   ```

   The code is 3 pairs. Each pair is a number of steps (1–9) and a direction. Directions always alternate.

2. Turn the handle. One step is a 60° turn. There are 3 ways to turn it:

   | Input | Clockwise (CW) | Counter-clockwise (CCW) |
   | --- | --- | --- |
   | **Drag** | Grab the wheel and drag it clockwise | Drag it counter-clockwise |
   | **Click / tap** | Right half of the door | Left half of the door |
   | **Keyboard** | `→` or `D` | `←` or `A` |

   For `2 CW, 7 CCW, 5 CW`: turn CW 2 steps, then CCW 7 steps, then CW 5 steps.

3. Changing direction locks in the current pair. The last pair unlocks the vault as soon as its count is reached.

- **Correct code:** the bolts clunk, the door swings open and the treasure glitters. After 5 s the door closes and a new round starts.
- **Wrong move:** the round fails instantly (wrong direction, too many steps, or switching direction too early). The handle spins like crazy, a new code is logged and the timer resets.

The keypad LCD on the left shows how long the unlock takes. It starts on your first move. The 3 LEDs under it show your progress per pair. The speaker button in the top-right corner mutes the synthesized sound effects.

## Features

- Loader with an LCD-style percentage, then a skippable intro (lamps flick on, room fades up, LCD boots).
- Idle life: flickering wall lamps, drifting dust motes, floor shimmer, handle sheen, door glint, LCD scanlines, glowing keypad and a "try me" nudge after 6 s without input.
- Weighty handle steps (anticipation, overshoot, notch settle), rubber-band drag and an input buffer for rapid clicks.
- Fail drama: red flash, camera shake, radial motion blur on the crazy spin.
- Win cinematic: fake-3D door swing on a `PerspectiveMesh`, light burst, bloom, camera push-in, coin burst, glitter and shine sweep, "VAULT OPENED" banner.
- Synthesized Web Audio sound (no audio files).
- Responsive: the background covers the screen and the door + keypad always stay fully visible, in landscape and portrait.
- Respects `prefers-reduced-motion` (shorter spin, no shake or camera push, fewer particles).
- The timer pauses while the tab is hidden.

## Setup

```bash
npm install
npm run start
```

## Commands

| Command           | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| `npm run start`   | Run dev server on port 3000                                          |
| `npm run build`   | Type-check and build for production                                  |
| `npm run preview` | Preview production build (must run `build` before running `preview`) |
| `npm run lint`    | Lint and auto-fix `src`                                              |

Dev only: open `/?debug` for a calibration overlay (`1`/`2` preview images at 50%, `0` hides them, `3` scrubs the door swing with the mouse). It also exposes `globalThis.__VAULT__` in the console.

## Architecture

All scene objects work in a fixed 2400×1108 **design space**. Only `Viewport` reads the screen size, and only `VaultScene` scales. Every animation is GSAP, and Pixi renders from the GSAP ticker, so there is one shared RAF. There is no `setTimeout`/`setInterval`: waits use `delay()` (built on `gsap.delayedCall`) with async/await. Tuned numbers live in `src/config.ts`.

```
main.ts                registers GSAP plugins, waits for fonts
└─ App (Application)   renderer, GSAP-driven ticker, Viewport, DPR tracking
   └─ Game             loader → warm-up → intro → game loop, event wiring
      ├─ Loader                LCD percentage + bar (ui)
      ├─ Backdrop              blurred mirrored fill for letterbox gaps
      ├─ VaultScene            design-space world: lens (push-in) → camera (shake)
      │  ├─ Background, FloorShimmer
      │  ├─ TreasureLayer      bloom, Glitter, shine sweep
      │  ├─ LightBurst         sunburst rays + glow
      │  ├─ Door               face (closed + glint Sheen + Handle), DoorSwing, open sprite
      │  │  └─ Handle          wheel + shadow + Sheen, step/drag/spin feel
      │  ├─ ParticleBurst      pooled coins, gems, sparks, dust
      │  ├─ KeypadDisplay      LCD digits, ProgressLeds, scanline overlay
      │  ├─ DirectionArrows, WinBanner
      │  ├─ blackout           intro fade
      │  └─ ambienceLayer      WallLamps, DustMotes, keypad glow
      ├─ ScreenFx              vignette, warm flash, shake helper
      └─ MuteButton

GameStateMachine       async loop: Idle → Input → Unlocking → Open → Closing | Failing
├─ CombinationLock     pure rules (instant check), uses Combination
├─ HandleInput         drag + tap + keyboard → step events
└─ Timer               elapsed time, pauses on hidden tab

Ambience               start / pause / resume all idle loops, idle nudge
Intro                  skippable reveal timeline
GpuWarmup              precompiles filter shaders, uploads textures before the intro
TextureFactory         cached procedural textures (radial, band, canvas)
AudioManager           Web Audio synth + mute (persisted)
```

| Folder | Contents |
| --- | --- |
| `src/core` | `App`, `Viewport`, `AssetLoader` |
| `src/scenes` | `Game`, `VaultScene`, `Intro` |
| `src/logic` | `GameStateMachine`, `CombinationLock`, `Combination`, `Timer` |
| `src/objects` | Scene objects (door, handle, keypad, LEDs, arrows, treasure, backdrop) |
| `src/fx` | Effects, ambience, texture cache, warm-up |
| `src/ui` | `Loader`, `MuteButton`, `WinBanner` |
| `src/input` | `HandleInput` |
| `src/audio` | `AudioManager` |
| `src/debug` | Dev-only calibration overlay (tree-shaken from production) |

## Tech stack

- [PixiJS 8](https://pixijs.com) with [pixi-filters 6](https://github.com/pixijs/filters) (glow, bloom, radial blur, kawase blur)
- [GSAP 3](https://gsap.com) with PixiPlugin, CustomEase and Physics2DPlugin
- TypeScript (strict), Vite, ESLint, Prettier
- Google Fonts: Share Tech Mono (LCD), Orbitron (banner)

## Assets

Files in `public/<category>/<name>.<ext>` load automatically and are available by `<name>` alias, e.g. `Sprite.from("doorClosed")`. The original challenge assets and previews are kept in `dreamshot challenge/`.
