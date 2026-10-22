import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import { GLITTER } from "../config";

interface Sparkle {
  sprite: Sprite;
  peak: number;
  loop?: gsap.core.Timeline;
}

export default class Glitter extends Container {
  label = "Glitter";

  private sparkles: Sparkle[] = [];
  private fade?: gsap.core.Tween;

  constructor() {
    super();

    for (let i = 0; i < GLITTER.count; i++) {
      const sprite = Sprite.from("shine");

      sprite.anchor.set(0.5);
      sprite.blendMode = "add";
      sprite.scale.set(0);
      this.addChild(sprite);
      this.sparkles.push({ sprite, peak: 0 });
    }

    this.visible = false;
  }

  start() {
    this.halt();
    this.alpha = 1;
    this.visible = true;
    this.sparkles.forEach((sparkle) => this.loop(sparkle));
  }

  stop() {
    this.fade?.kill();
    this.fade = gsap.to(this, {
      alpha: 0,
      duration: GLITTER.fade,
      ease: "power2.in",
      onComplete: () => this.halt(),
    });

    return this.fade;
  }

  private loop(sparkle: Sparkle) {
    const { sprite } = sparkle;
    const { spin, startDelay } = GLITTER;
    const loop = gsap.timeline({
      repeat: -1,
      repeatRefresh: true,
      delay: gsap.utils.random(0, startDelay),
    });

    sprite.scale.set(0);
    sprite.alpha = 0;
    sparkle.loop = loop;

    loop
      .call(() => this.place(sparkle))
      .fromTo(
        sprite.scale,
        { x: 0, y: 0 },
        {
          x: () => sparkle.peak,
          y: () => sparkle.peak,
          duration: 0.5,
          ease: "sine.out",
        },
      )
      .to(sprite.scale, { x: 0, y: 0, duration: 0.5, ease: "sine.in" })
      .fromTo(
        sprite,
        { alpha: 0 },
        { alpha: 1, duration: 0.3, ease: "sine.inOut" },
        0,
      )
      .to(sprite, { alpha: 0, duration: 0.4, ease: "sine.inOut" }, 0.6)
      .to(
        sprite,
        {
          angle: () => `+=${gsap.utils.random(spin.min, spin.max)}`,
          duration: 1,
          ease: "none",
        },
        0,
      );
  }

  private place(sparkle: Sparkle) {
    const { hotspots, jitter, scale, duration } = GLITTER;
    const [x, y] = hotspots[gsap.utils.random(0, hotspots.length - 1, 1)];

    sparkle.sprite.position.set(
      x + gsap.utils.random(-jitter, jitter),
      y + gsap.utils.random(-jitter, jitter),
    );
    sparkle.sprite.angle = gsap.utils.random(0, 90);
    sparkle.peak = gsap.utils.random(scale.min, scale.max);
    sparkle.loop?.timeScale(1 / gsap.utils.random(duration.min, duration.max));
  }

  private halt() {
    this.fade?.kill();
    this.sparkles.forEach((sparkle) => {
      sparkle.loop?.kill();
      sparkle.loop = undefined;
      sparkle.sprite.scale.set(0);
    });
    this.visible = false;
  }
}
