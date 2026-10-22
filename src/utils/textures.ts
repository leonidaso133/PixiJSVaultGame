import { Texture } from "pixi.js";

export function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);

  return Texture.from(canvas);
}

export function radialTexture(size: number, stops: [number, string][]) {
  return canvasTexture(size, size, (ctx) => {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);

    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
}
