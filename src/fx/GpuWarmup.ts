import "pixi.js/prepare";
import {
  ColorMatrixFilter,
  Container,
  Filter,
  PerspectiveMesh,
  Renderer,
  RenderTexture,
  Sprite,
  Texture,
} from "pixi.js";
import {
  AdvancedBloomFilter,
  GlowFilter,
  RadialBlurFilter,
} from "pixi-filters";
import { ARROWS, HANDLE, LEDS, TREASURE } from "../config";
import Door from "../objects/Door";

export default class GpuWarmup {
  static async run(renderer: Renderer, scene: Container, door: Door) {
    const { bloom } = TREASURE;
    const target = RenderTexture.create({ width: 32, height: 32 });
    const probe = new Sprite(Texture.WHITE);
    const mesh = new PerspectiveMesh({ texture: Texture.WHITE });
    const filters: Filter[] = [
      new GlowFilter({
        distance: LEDS.glow.distance,
        quality: LEDS.glow.quality,
      }),
      new GlowFilter({
        distance: ARROWS.glow.distance,
        quality: ARROWS.glow.quality,
      }),
      new AdvancedBloomFilter({
        threshold: bloom.threshold,
        blur: bloom.blur,
        quality: bloom.quality,
      }),
      new RadialBlurFilter({ kernelSize: HANDLE.blur.kernelSize, radius: -1 }),
      new ColorMatrixFilter(),
    ];
    const stage = new Container({ children: [probe, mesh] });

    probe.setSize(16);
    mesh.setSize(16);

    filters.forEach((filter) => {
      probe.filters = [filter];
      renderer.render({ container: stage, target, clear: true });
      filter.destroy();
    });

    stage.destroy({ children: true });
    target.destroy(true);
    door.swing.bake(door.face);
    await renderer.prepare.upload(scene);
  }
}
