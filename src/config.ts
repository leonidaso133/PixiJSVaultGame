export const DESIGN = { width: 2400, height: 1108 } as const;

export const SAFE_RECT = { x: 640, y: 100, width: 1520, height: 820 } as const;

export const DOOR = {
  position: { x: 1198, y: 513.5 },
  closed: { pivot: { x: 380, y: 387.5 } },
  open: { offset: { x: 357, y: -382.5 } },
  hitRadius: 373,
  anim: { duration: 0.4, ease: "power2.inOut" },
} as const;

export const EASES = {
  vaultStep: "M0,0 C0.25,0 0.3,1.12 0.55,1.08 0.75,1.03 0.85,1 1,1",
} as const;

export const HANDLE = {
  offset: { x: 0, y: 0 },
  pivot: { x: 175, y: 198.5 },
  stepAngle: 60,
  hitRadius: 175,
  anticipation: { angle: 4, duration: 0.06, ease: "power2.out" },
  drive: { duration: 0.32, ease: "vaultStep", notch: 0.5 },
  settle: { angle: 1.5, duration: 0.25, ease: "elastic.out(1, 0.4)" },
  squash: 0.97,
  follow: { duration: 0.15, ease: "power3" },
  snapThrough: { punch: 0.975, duration: 0.18, ease: "power2.out" },
  snap: { duration: 0.4, ease: "elastic.out(1, 0.5)" },
  hover: {
    wobble: 1.5,
    period: 0.9,
    brightness: 1.14,
    fade: 0.25,
    ease: "sine.inOut",
  },
  spin: {
    minTurns: 3,
    maxTurns: 5,
    delay: 0.15,
    duration: 1.8,
    ease: "power4.out",
    overshoot: 10,
    settle: { duration: 0.5, ease: "elastic.out(1, 0.35)" },
  },
  blur: { kernelSize: 15, padding: 24, perDegree: 1.6, max: 70 },
} as const;

export const SHADOW = {
  pivot: { x: 178, y: 201.5 },
  offset: { x: 2, y: 5 },
  lift: { offset: 1.15, alpha: 0.15 },
} as const;

export const DRAG = { maxLag: 22, softness: 30 } as const;

export const KEYPAD = {
  glass: { x: 694, y: 426, width: 93, height: 84, radius: 9 },
  tint: { color: 0x020814, alpha: 0.35 },
  text: {
    fontFamily: "Share Tech Mono",
    fontSize: 20,
    fill: 0x7fe9ff,
    glow: 0x00b4ff,
    resolution: 4,
    initial: "00:00.00",
    y: 36,
  },
  error: { text: "ERROR", fill: 0xff4d4d, glow: 0xff1a1a, blinks: 4 },
  roll: { duration: 0.12, stagger: 0.035, ease: "power2.in" },
} as const;

export const LEDS = {
  count: 3,
  y: 64,
  spacing: 22,
  radius: 4.5,
  colors: {
    off: 0x1a2433,
    active: 0xffb02e,
    done: 0x4dff88,
    error: 0xff3b3b,
  },
  rim: { color: 0x000000, alpha: 0.6, width: 1.5 },
  pulse: { min: 0.35, duration: 0.55, ease: "sine.inOut" },
  pop: { scale: 1.25, duration: 0.3, ease: "back.out(3)" },
  glow: { distance: 10, peak: 2, rest: 1, quality: 0.3 },
  flash: { times: 3, duration: 0.12 },
  reset: { duration: 0.2, stagger: 0.08 },
} as const;

export const ARROWS = {
  radius: 322,
  lift: 25,
  span: 28,
  thickness: 11,
  head: 26,
  color: 0xffc94a,
  glow: { color: 0xffa800, distance: 14, strength: 2.4, quality: 0.3 },
  fade: { duration: 0.25, ease: "power2.out" },
  pulse: { min: 0.55, duration: 0.6, ease: "sine.inOut" },
  nudge: { angle: 4, duration: 0.3, ease: "power2.out" },
  touchAlpha: 0.35,
} as const;

export const FX = {
  shake: { strength: 12, duration: 0.4 },
  vignette: {
    color: "#ff1a1a",
    peak: 0.45,
    in: 0.08,
    out: 0.42,
    inner: 0.35,
    size: 512,
  },
} as const;

export const FAIL = { resetAt: 2.05, settleBlur: 0.3 } as const;

export const AUDIO = { volume: 0.6, storageKey: "vault.muted" } as const;

export const MUTE = {
  size: 44,
  margin: 16,
  color: 0xffc94a,
  background: { color: 0x05081a, alpha: 0.55 },
  hover: { scale: 1.08, duration: 0.15 },
} as const;

export const INPUT = {
  dragDeadzone: 8,
  tapMaxMs: 400,
  bufferSize: 2,
  keys: { CCW: ["ArrowLeft", "a", "A"], CW: ["ArrowRight", "d", "D"] },
} as const;

export const GAME = { pairs: 3, minValue: 1, maxValue: 9, winHold: 5 } as const;

export const BACKDROP = {
  band: 120,
  overlap: 4,
  blur: 10,
  quality: 5,
  tint: 0x7a86a8,
  fade: { color: 0x05081a, alpha: 0.92 },
} as const;

export const INTRO = { duration: 0.8, ease: "power2.out" } as const;

export const LOADING = {
  fontFamily: "Share Tech Mono",
  fontSize: 40,
  fill: 0x7fe9ff,
} as const;

export const TICKER = { lagThreshold: 500, adjustedLag: 33 } as const;
