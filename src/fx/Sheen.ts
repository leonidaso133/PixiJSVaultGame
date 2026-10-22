import gsap from "gsap";
import { Container, Sprite, Texture } from "pixi.js";
import TextureFactory from "./TextureFactory";

export interface SheenOptions {
  width: number;
  height: number;
  angle: number;
  alpha: number;
  travel: number;
  duration: number;
  ease: string;
}

export default class Sheen extends Container {
  label = "Sheen";

  readonly clip: Sprite;

  private band: Sprite;
  private timeline?: gsap.core.Timeline;

  constructor(
    texture: Texture,
    pivot: { x: number; y: number },
    private options: SheenOptions,
  ) {
    super();

    this.eventMode = "none";
    this.band = new Sprite(TextureFactory.sheenBand());
    this.band.anchor.set(0.5);
    this.band.setSize(options.width, options.height);
    this.band.angle = options.angle;
    this.band.blendMode = "add";

    this.clip = new Sprite(texture);
    this.clip.pivot.set(pivot.x, pivot.y);

    this.addChild(this.band, this.clip);
    this.band.mask = this.clip;
    this.band.visible = false;
  }

  sweep() {
    const { travel, alpha, duration, ease } = this.options;

    this.timeline?.kill();
    this.timeline = gsap
      .timeline({ onComplete: () => (this.band.visible = false) })
      .set(this.band, { visible: true })
      .fromTo(this.band, { x: -travel }, { x: travel, duration, ease })
      .fromTo(
        this.band,
        { alpha: 0 },
        {
          alpha,
          duration: duration / 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        },
        "<",
      );

    return this.timeline;
  }

  stop(duration: number) {
    this.timeline?.kill();
    if (!this.band.visible) return;

    this.timeline = gsap.timeline().to(this.band, {
      alpha: 0,
      duration,
      onComplete: () => (this.band.visible = false),
    });
  }
}
