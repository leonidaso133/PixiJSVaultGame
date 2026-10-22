export const DESIGN = { width: 2400, height: 1108 } as const;

export const SAFE_RECT = { x: 640, y: 100, width: 1520, height: 820 } as const;

export const DOOR = {
  position: { x: 1198, y: 513.5 },
  closed: { pivot: { x: 380, y: 387.5 } },
  open: { offset: { x: 357, y: -382.5 } },
  hitRadius: 373,
  jolt: { x: 4, out: 0.05, back: 0.25, ease: "elastic.out(1, 0.4)" },
} as const;

export const SWING = {
  hinge: 410,
  focal: 5000,
  angle: 125,
  thickness: 95,
  vertices: 16,
  resolution: 1,
  flip: 0.05,
  shade: 0.55,
  morph: 0.55,
  rim: {
    segments: 48,
    radius: { x: 380, y: 389 },
    color: 0x3a4870,
    edge: { color: 0x8fa3d6, width: 2, alpha: 0.8 },
  },
  target: { x: 357, y: -382.5, width: 582, height: 772 },
  open: { duration: 1.1, ease: "power3.inOut" },
  close: { duration: 0.9, ease: "power2.in" },
  crossfade: 0.12,
  hingePivot: { x: 40, y: 386 },
  settle: { scale: 0.985, out: 0.12, back: 0.5, ease: "back.out(2)" },
  shadow: { x: 760, y: 40, width: 760, height: 900, alpha: 0.5, size: 256 },
} as const;

export const TREASURE = {
  center: { x: 1198, y: 513.5 },
  radius: 292,
  bloom: {
    threshold: 0.6,
    blur: 8,
    quality: 4,
    padding: 48,
    peak: 2.5,
    rest: 0.35,
    in: 0.4,
    out: 1.2,
    dim: 0.6,
  },
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
  release: {
    angle: 90,
    duration: 0.45,
    ease: "power2.out",
    scale: 1.06,
    lift: 2,
  },
  home: { steps: 2, duration: 0.7, ease: "back.out(1.4)" },
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
  celebrate: {
    flash: { fill: 0xffffff, glow: 0xffffff, times: 2, duration: 0.09 },
    fill: 0xffd34a,
    glow: 0xffa800,
  },
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
  chase: { stagger: 0.08, gap: 0.1, flash: { times: 2, duration: 0.1 } },
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
  unlockShake: { strength: 5, duration: 0.25 },
  slamShake: { strength: 8, duration: 0.35 },
  flash: { color: 0xffc35a, peak: 0.1, in: 0.15, out: 0.45 },
  vignette: {
    color: "#ff1a1a",
    peak: 0.45,
    in: 0.08,
    out: 0.42,
    inner: 0.35,
    size: 512,
  },
} as const;

export const LIGHT = {
  rays: {
    size: 1700,
    count: 18,
    color: "255, 214, 140",
    texture: 512,
    peak: 0.5,
    rest: 0.15,
    period: 40,
    grow: 1.15,
  },
  glow: {
    size: 1100,
    color: "255, 195, 90",
    texture: 256,
    peak: 0.7,
    rest: 0.15,
  },
  in: 0.35,
  settle: 1.2,
  dim: 0.6,
} as const;

export const GLITTER = {
  count: 14,
  jitter: 28,
  scale: { min: 0.4, max: 0.9 },
  spin: { min: 45, max: 90 },
  duration: { min: 0.6, max: 1.2 },
  startDelay: 1.2,
  fade: 0.4,
  hotspots: [
    [1216, 542],
    [1174, 446],
    [1058, 732],
    [1368, 396],
    [1320, 720],
    [1044, 648],
    [1050, 630],
    [1044, 450],
    [1416, 510],
    [1140, 600],
    [1392, 666],
    [978, 480],
    [1008, 384],
    [1200, 258],
  ],
  sweep: {
    width: 220,
    height: 900,
    angle: 25,
    alpha: 0.55,
    travel: 460,
    duration: 0.7,
    period: 1.8,
    ease: "power1.inOut",
  },
} as const;

export const PARTICLES = {
  count: 40,
  spread: 140,
  velocity: { min: 500, max: 1050 },
  angle: { min: -160, max: -20 },
  gravity: 1500,
  duration: { min: 1.2, max: 1.9 },
  scale: { min: 0.4, max: 0.85 },
  spin: 720,
  texture: 48,
  sparkScale: 0.18,
  gems: [0x5ad1ff, 0xff4d6d, 0x59ff9a],
  dust: {
    count: 22,
    radius: 378,
    velocity: { min: 50, max: 150 },
    gravity: -40,
    duration: { min: 0.9, max: 1.4 },
    scale: { from: 0.8, to: 2.4 },
    alpha: 0.6,
    tint: 0xa7aec0,
    texture: 64,
  },
} as const;

export const BANNER = {
  y: 690,
  title: "VAULT OPENED",
  font: { fontFamily: "Orbitron", fontWeight: "900", fontSize: 48 },
  letterSpacing: 4,
  titleY: -18,
  colors: ["#fff6c8", "#ffd34a", "#c98a12"],
  stroke: { color: 0x3b2300, width: 3 },
  shadow: { color: 0x000000, blur: 6, distance: 3, alpha: 0.6 },
  glow: {
    color: 0xffa800,
    distance: 14,
    strength: 1.6,
    quality: 0.3,
    delay: 0.5,
  },
  resolution: 2,
  time: {
    fontFamily: "Share Tech Mono",
    fontSize: 30,
    fill: 0xfff1c2,
    glow: 0xffa800,
    y: 40,
    count: 0.6,
    delay: 0.3,
  },
  ribbon: {
    width: 700,
    height: 140,
    alpha: 0.85,
    fade: 0.18,
    color: "5,8,26",
    line: { color: "255,201,74", width: 2, inset: 6 },
  },
  letters: { stagger: 0.04, duration: 0.5, ease: "back.out(2)", rise: 14 },
  show: { duration: 0.35, ease: "power2.out" },
  hide: { duration: 0.35, ease: "power2.in", drop: 16 },
} as const;

export const PUSH = {
  scale: 1.04,
  in: { duration: 2, ease: "sine.inOut" },
  out: { duration: 1.1, ease: "sine.inOut" },
  keep: { x: 694, y: 126, width: 1446, height: 779 },
} as const;

export const WIN = {
  unlock: 0.05,
  release: 0.35,
  clunk: 0.6,
  swing: 0.75,
  burst: 0.9,
  reveal: 1.7,
  open: 1.85,
} as const;

export const CLOSE = { swing: 0.5, reset: 0.15 } as const;

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

export const AMBIENCE = {
  lamps: {
    color: 0xffc670,
    spots: [
      { x: 620, y: 0, width: 420, height: 260, alpha: 0.55 },
      { x: 1780, y: 0, width: 420, height: 260, alpha: 0.55 },
      { x: 1200, y: 0, width: 300, height: 120, alpha: 0.35 },
      { x: 405, y: 230, width: 70, height: 520, alpha: 0.35 },
      { x: 1992, y: 230, width: 70, height: 520, alpha: 0.35 },
      { x: 530, y: 855, width: 240, height: 60, alpha: 0.45 },
      { x: 1870, y: 855, width: 240, height: 60, alpha: 0.45 },
    ],
    flicker: {
      dip: { min: 0.55, max: 0.85 },
      step: 0.07,
      rest: { min: 0.8, max: 3.2 },
      speed: { min: 0.6, max: 1.6 },
    },
    breathe: { min: 0.85, duration: 2.4, ease: "sine.inOut" },
    flickOn: {
      stagger: 0.1,
      steps: [0.7, 0.1, 0.9, 0.25, 1],
      step: 0.05,
      boost: 1.8,
    },
  },
  sheen: {
    handle: {
      width: 120,
      height: 520,
      angle: 25,
      alpha: 1,
      travel: 240,
      duration: 0.9,
      ease: "power2.inOut",
      every: { min: 4, max: 6 },
    },
    door: {
      width: 240,
      height: 1200,
      angle: 25,
      alpha: 0.22,
      travel: 560,
      duration: 1.6,
      ease: "sine.inOut",
      every: { min: 8, max: 12 },
    },
    fade: 0.25,
  },
  keypad: {
    keys: { x: 696, y: 522, width: 86, height: 108, color: 0x4d7dff },
    pulse: { min: 0.05, max: 0.22, duration: 1.8, ease: "sine.inOut" },
    scanlines: { gap: 3, alpha: 0.18 },
    scan: { height: 18, alpha: 0.12, duration: 2.6, rest: 1.4 },
    flicker: { min: 0.88, step: 0.06, rest: { min: 1.5, max: 4 } },
  },
  floor: {
    top: 905,
    poly: [330, 905, 2070, 905, 2400, 1060, 2400, 1108, 0, 1108, 0, 1060],
    bands: [
      { y: 990, width: 900, height: 260, alpha: 0.07, duration: 9 },
      { y: 1050, width: 600, height: 200, alpha: 0.05, duration: 13 },
    ],
    tint: 0xbcd4ff,
    angle: -12,
    ease: "sine.inOut",
  },
  dust: {
    count: 14,
    color: 0xffe2b0,
    beams: [620, 1780],
    top: 20,
    bottom: 460,
    spread: { base: 30, perY: 0.3 },
    size: { min: 4, max: 9 },
    alpha: { min: 0.2, max: 0.55 },
    drift: { x: 40, y: { min: -70, max: 30 } },
    life: { min: 4, max: 7 },
  },
  nudge: {
    after: 6,
    wobble: 6,
    in: 0.15,
    out: 1,
    ease: "elastic.out(1, 0.3)",
    arrows: { alpha: 0.9, hold: 0.6, angle: 6, ease: "elastic.out(1, 0.35)" },
  },
} as const;

export const INTRO = {
  lamps: 0.2,
  room: 0.9,
  handle: 1.5,
  lcd: 1.7,
  hint: 2.2,
  fade: { duration: 0.8, ease: "power2.out" },
  dim: { alpha: 0.82, steps: 6 },
  spin: { angle: 60, duration: 0.7, ease: "back.out(1.6)" },
  boot: { text: "88:88.88", times: 2, duration: 0.08 },
} as const;

export const LOADER = {
  fontFamily: "Share Tech Mono",
  fontSize: 44,
  fill: 0x7fe9ff,
  glow: 0x00b4ff,
  label: { text: "UNSEALING VAULT", fontSize: 14, letterSpacing: 4, y: -46 },
  bar: { width: 260, height: 4, y: 40, track: 0x123048, radius: 2 },
  ease: { duration: 0.35, ease: "power2.out" },
  finish: { fill: 0.25, blinks: 2, blink: 0.08, fade: 0.35 },
} as const;

export const MOTION = {
  spin: { minTurns: 1, maxTurns: 2, duration: 1 },
  particles: 0.5,
} as const;

export const TICKER = { lagThreshold: 500, adjustedLag: 33 } as const;

export const DISPLAY = { maxResolution: 2 } as const;
