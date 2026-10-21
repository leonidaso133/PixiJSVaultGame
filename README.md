# PixiJS Vault Game

Vault-cracking mini game built with [PixiJS v8](https://github.com/pixijs/pixijs), [GSAP](https://gsap.com) and [Vite](https://vitejs.dev).

Based on [DreamShotTask/pixi-minimal](https://github.com/DreamShotTask/pixi-minimal).

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

## Assets

Files in `public/<category>/<name>.<ext>` load automatically and are available by `<name>` alias, e.g. `Sprite.from("doorClosed")`.
