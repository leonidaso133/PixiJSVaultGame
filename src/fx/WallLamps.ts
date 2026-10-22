import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import { AMBIENCE } from "../config";
import { reducedMotion } from "../utils/motion";
import TextureFactory from "./TextureFactory";

const random = gsap.utils.random;

interface Lamp {
  sprite: Sprite;
  base: number;
  loop?: gsap.core.Timeline;
}

export default class WallLamps extends Container {
  label = "WallLamps";

  private lamps: Lamp[];
  private intro?: gsap.core.Timeline;

  constructor() {
    super();

    const { spots, color } = AMBIENCE.lamps;

    this.eventMode = "none";
    this.lamps = spots.map(({ x, y, width, height, alpha }) => {
      const sprite = new Sprite(TextureFactory.softDot());

      sprite.anchor.set(0.5);
      sprite.position.set(x, y);
      sprite.setSize(width, height);
      sprite.tint = color;
      sprite.blendMode = "add";
      sprite.alpha = alpha;
      this.addChild(sprite);

      return { sprite, base: alpha };
    });
  }

  darken() {
    this.lamps.forEach((lamp) => (lamp.sprite.alpha = 0));
  }

  flickOn() {
    const { stagger, steps, step, boost } = AMBIENCE.lamps.flickOn;

    this.intro?.kill();
    this.intro = gsap.timeline();
    gsap.utils.shuffle([...this.lamps]).forEach((lamp, i) => {
      steps.forEach((level, j) => {
        this.intro!.to(
          lamp.sprite,
          {
            alpha: lamp.base * boost * level,
            duration: step,
            ease: "steps(1)",
          },
          i * stagger + j * step,
        );
      });
    });

    return this.intro;
  }

  settle(duration: number) {
    return gsap.to(
      this.lamps.map((lamp) => lamp.sprite),
      {
        alpha: (i: number) => this.lamps[i].base,
        duration,
        ease: "sine.inOut",
      },
    );
  }

  start() {
    this.lamps.forEach((lamp) => {
      lamp.loop?.kill();
      lamp.loop = reducedMotion() ? this.breathe(lamp) : this.flicker(lamp);
    });
  }

  pause() {
    this.lamps.forEach((lamp) => {
      lamp.loop?.pause();
      gsap.to(lamp.sprite, { alpha: lamp.base, duration: 0.2 });
    });
  }

  resume() {
    this.lamps.forEach((lamp) => lamp.loop?.resume());
  }

  private flicker(lamp: Lamp) {
    const { dip, step, rest, speed } = AMBIENCE.lamps.flicker;
    const { sprite, base } = lamp;
    const level = (min: number, max: number) => () => base * random(min, max);
    const loop = gsap.timeline({
      repeat: -1,
      repeatRefresh: true,
      defaults: { ease: "none" },
      delay: random(0, rest.max),
      repeatDelay: random(rest.min, rest.max),
      onRepeat: () => {
        loop.repeatDelay(random(rest.min, rest.max));
        loop.timeScale(random(speed.min, speed.max));
      },
    });

    return loop
      .to(sprite, { alpha: level(dip.min, dip.max), duration: step })
      .to(sprite, { alpha: level(0.92, 1.05), duration: step * 2 })
      .to(sprite, { alpha: level(dip.max, 1), duration: step })
      .to(sprite, { alpha: base, duration: step * 3, ease: "sine.out" });
  }

  private breathe(lamp: Lamp) {
    const { min, duration, ease } = AMBIENCE.lamps.breathe;

    return gsap
      .timeline({ repeat: -1, yoyo: true })
      .to(lamp.sprite, { alpha: lamp.base * min, duration, ease });
  }
}
