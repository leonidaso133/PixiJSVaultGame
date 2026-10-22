import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import { AMBIENCE } from "../config";
import { reducedMotion } from "../utils/motion";
import TextureFactory from "./TextureFactory";

const random = gsap.utils.random;

interface Mote {
  sprite: Sprite;
  peak: number;
  dx: number;
  dy: number;
  loop?: gsap.core.Timeline;
}

export default class DustMotes extends Container {
  label = "DustMotes";

  private motes: Mote[] = [];

  constructor() {
    super();

    const { count, color } = AMBIENCE.dust;

    this.eventMode = "none";

    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(TextureFactory.softDot());

      sprite.anchor.set(0.5);
      sprite.tint = color;
      sprite.blendMode = "add";
      sprite.alpha = 0;
      this.addChild(sprite);
      this.motes.push({ sprite, peak: 0, dx: 0, dy: 0 });
    }
  }

  start() {
    const active = reducedMotion()
      ? Math.ceil(this.motes.length / 2)
      : this.motes.length;

    this.motes.forEach((mote, i) => {
      mote.loop?.kill();
      mote.sprite.alpha = 0;
      if (i < active) mote.loop = this.loop(mote);
    });
  }

  pause() {
    this.motes.forEach((mote) => mote.loop?.pause());
  }

  resume() {
    this.motes.forEach((mote) => mote.loop?.resume());
  }

  private loop(mote: Mote) {
    const { life } = AMBIENCE.dust;
    const { sprite } = mote;
    const loop = gsap.timeline({
      repeat: -1,
      repeatRefresh: true,
      delay: random(0, life.max),
      onRepeat: () => loop.timeScale(1 / random(life.min, life.max)),
    });

    loop.timeScale(1 / random(life.min, life.max));

    return loop
      .call(() => this.place(mote))
      .to(sprite, { x: () => `+=${mote.dx}`, duration: 1, ease: "none" }, 0)
      .to(
        sprite,
        { y: () => `+=${mote.dy}`, duration: 1, ease: "sine.inOut" },
        0,
      )
      .to(
        sprite,
        { alpha: () => mote.peak, duration: 0.35, ease: "sine.out" },
        0,
      )
      .to(sprite, { alpha: 0, duration: 0.4, ease: "sine.in" }, 0.6);
  }

  private place(mote: Mote) {
    const { beams, top, bottom, spread, size, alpha, drift } = AMBIENCE.dust;
    const y = random(top, bottom);
    const half = spread.base + spread.perY * y;
    const diameter = random(size.min, size.max);

    mote.sprite.position.set(
      beams[random(0, beams.length - 1, 1)] + random(-half, half),
      y,
    );
    mote.sprite.setSize(diameter);
    mote.sprite.alpha = 0;
    mote.peak = random(alpha.min, alpha.max);
    mote.dx = random(-drift.x, drift.x);
    mote.dy = random(drift.y.min, drift.y.max);
  }
}
