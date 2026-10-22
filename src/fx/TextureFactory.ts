import { Texture } from "pixi.js";

export type ColorStops = [number, string][];

export default class TextureFactory {
  private static cache = new Map<string, Texture>();

  static get(key: string, create: () => Texture) {
    let texture = this.cache.get(key);

    if (!texture) {
      texture = create();
      this.cache.set(key, texture);
    }

    return texture;
  }

  static canvas(
    key: string,
    width: number,
    height: number,
    draw: (ctx: CanvasRenderingContext2D) => void,
  ) {
    return this.get(key, () => {
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;
      draw(canvas.getContext("2d")!);

      return Texture.from(canvas);
    });
  }

  static radial(key: string, size: number, stops: ColorStops) {
    return this.canvas(key, size, size, (ctx) => {
      const half = size / 2;
      const gradient = ctx.createRadialGradient(
        half,
        half,
        0,
        half,
        half,
        half,
      );

      stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    });
  }

  static band(key: string, size: number, stops: ColorStops) {
    return this.canvas(key, size, size, (ctx) => {
      const gradient = ctx.createLinearGradient(0, 0, size, 0);

      stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    });
  }

  static warmBand() {
    return this.band("warmBand", 128, [
      [0, "rgba(255,240,200,0)"],
      [0.5, "rgba(255,246,220,0.9)"],
      [1, "rgba(255,240,200,0)"],
    ]);
  }

  static sheenBand() {
    return this.band("sheenBand", 128, [
      [0, "rgba(255,250,235,0)"],
      [0.3, "rgba(255,250,235,0.12)"],
      [0.5, "rgba(255,255,250,1)"],
      [0.7, "rgba(255,250,235,0.12)"],
      [1, "rgba(255,250,235,0)"],
    ]);
  }

  static softDot() {
    return this.radial("softDot", 64, [
      [0, "rgba(255,255,255,1)"],
      [0.4, "rgba(255,255,255,0.45)"],
      [1, "rgba(255,255,255,0)"],
    ]);
  }
}
