export const DESIGN = { width: 2400, height: 1108 } as const;

export const SAFE_RECT = { x: 640, y: 100, width: 1520, height: 820 } as const;

export const DOOR = {
  position: { x: 1198, y: 513.5 },
  closed: { pivot: { x: 380, y: 387.5 } },
  open: { offset: { x: 357, y: -382.5 } },
} as const;

export const HANDLE = {
  offset: { x: 0, y: 0 },
  pivot: { x: 175, y: 198.5 },
  stepAngle: 60,
} as const;

export const SHADOW = {
  pivot: { x: 178, y: 201.5 },
  offset: { x: 2, y: 5 },
} as const;

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
  },
} as const;

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
