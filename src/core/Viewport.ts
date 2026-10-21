import { EventEmitter } from "pixi.js";
import { DESIGN, SAFE_RECT } from "../config";

export interface Layout {
  screenWidth: number;
  screenHeight: number;
  scale: number;
  coverScale: number;
  x: number;
  y: number;
  covers: boolean;
}

interface ViewportEvents {
  resize: [Layout];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default class Viewport extends EventEmitter<ViewportEvents> {
  layout!: Layout;

  update(screenWidth: number, screenHeight: number) {
    const coverScale = Math.max(
      screenWidth / DESIGN.width,
      screenHeight / DESIGN.height,
    );
    const safeScale = Math.min(
      screenWidth / SAFE_RECT.width,
      screenHeight / SAFE_RECT.height,
    );
    const scale = Math.min(coverScale, safeScale);

    this.layout = {
      screenWidth,
      screenHeight,
      scale,
      coverScale,
      x: this.fit(
        screenWidth,
        DESIGN.width,
        SAFE_RECT.x,
        SAFE_RECT.width,
        scale,
      ),
      y: this.fit(
        screenHeight,
        DESIGN.height,
        SAFE_RECT.y,
        SAFE_RECT.height,
        scale,
      ),
      covers: scale >= coverScale,
    };

    this.emit("resize", this.layout);

    return this.layout;
  }

  private fit(
    screen: number,
    design: number,
    safeStart: number,
    safeSize: number,
    scale: number,
  ) {
    const centered = (screen - design * scale) / 2;
    const safeMin = -safeStart * scale;
    const safeMax = screen - (safeStart + safeSize) * scale;
    const coverMin = Math.min(screen - design * scale, 0);
    const coverMax = Math.max(screen - design * scale, 0);
    const covered = clamp(centered, coverMin, coverMax);

    return clamp(covered, safeMin, safeMax);
  }
}
