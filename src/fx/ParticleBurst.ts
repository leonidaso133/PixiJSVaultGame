import gsap from "gsap";
import { Container, Sprite, Texture } from "pixi.js";
import { MOTION, PARTICLES } from "../config";
import { reducedMotion } from "../utils/motion";
import TextureFactory from "./TextureFactory";

const random = gsap.utils.random;

export default class ParticleBurst extends Container {
  label = "ParticleBurst";

  private spark = Texture.from("shine");
  private treasure: Sprite[] = [];
  private puffs: Sprite[] = [];
  private burstTimeline?: gsap.core.Timeline;
  private dustTimeline?: gsap.core.Timeline;

  constructor() {
    super();

    const coin = ParticleBurst.createCoin();
    const gem = ParticleBurst.createGem();
    const dust = TextureFactory.radial("dustPuff", PARTICLES.dust.texture, [
      [0, "rgba(255,255,255,0.9)"],
      [0.5, "rgba(255,255,255,0.35)"],
      [1, "rgba(255,255,255,0)"],
    ]);

    this.eventMode = "none";

    for (let i = 0; i < PARTICLES.count; i++) {
      const kind = i % 4;
      const sprite = new Sprite(
        kind < 2 ? coin : kind === 2 ? gem : this.spark,
      );

      if (kind === 2) sprite.tint = PARTICLES.gems[i % PARTICLES.gems.length];
      if (kind === 3) sprite.blendMode = "add";
      this.treasure.push(this.pooled(sprite));
    }

    for (let i = 0; i < PARTICLES.dust.count; i++) {
      const sprite = new Sprite(dust);

      sprite.tint = PARTICLES.dust.tint;
      this.puffs.push(this.pooled(sprite));
    }
  }

  burst(x: number, y: number) {
    const { spread, velocity, angle, gravity, duration, scale, spin } =
      PARTICLES;
    const timeline = gsap.timeline();

    this.burstTimeline?.kill();
    this.burstTimeline = timeline;

    ParticleBurst.active(this.treasure).forEach((sprite) => {
      const life = random(duration.min, duration.max);
      const size =
        random(scale.min, scale.max) *
        (sprite.texture === this.spark ? PARTICLES.sparkScale : 1);
      const offset = random(0, Math.PI * 2);
      const distance = random(0, spread);

      timeline
        .set(
          sprite,
          {
            x: x + Math.cos(offset) * distance,
            y: y + Math.sin(offset) * distance,
            angle: random(0, 360),
            alpha: 1,
            visible: true,
          },
          0,
        )
        .set(sprite.scale, { x: size, y: size }, 0)
        .to(
          sprite,
          {
            duration: life,
            physics2D: {
              velocity: random(velocity.min, velocity.max),
              angle: random(angle.min, angle.max),
              gravity,
            },
          },
          0,
        )
        .to(
          sprite,
          { angle: `+=${random(-spin, spin)}`, duration: life, ease: "none" },
          0,
        )
        .to(
          sprite,
          { alpha: 0, duration: life * 0.4, ease: "power1.in" },
          life * 0.6,
        )
        .set(sprite, { visible: false }, life);
    });

    return timeline;
  }

  dust(x: number, y: number) {
    const { radius, velocity, gravity, duration, scale, alpha } =
      PARTICLES.dust;
    const timeline = gsap.timeline();

    this.dustTimeline?.kill();
    this.dustTimeline = timeline;

    ParticleBurst.active(this.puffs).forEach((sprite) => {
      const life = random(duration.min, duration.max);
      const direction = random(0, 360);
      const radians = (direction * Math.PI) / 180;

      timeline
        .set(
          sprite,
          {
            x: x + Math.cos(radians) * radius,
            y: y + Math.sin(radians) * radius,
            alpha,
            visible: true,
          },
          0,
        )
        .fromTo(
          sprite.scale,
          { x: scale.from, y: scale.from },
          { x: scale.to, y: scale.to, duration: life, ease: "power2.out" },
          0,
        )
        .to(
          sprite,
          {
            duration: life,
            physics2D: {
              velocity: random(velocity.min, velocity.max),
              angle: direction,
              gravity,
            },
          },
          0,
        )
        .to(sprite, { alpha: 0, duration: life, ease: "power2.in" }, 0)
        .set(sprite, { visible: false }, life);
    });

    return timeline;
  }

  private static active(pool: Sprite[]) {
    return reducedMotion()
      ? pool.slice(0, Math.ceil(pool.length * MOTION.particles))
      : pool;
  }

  private pooled(sprite: Sprite) {
    sprite.anchor.set(0.5);
    sprite.visible = false;
    this.addChild(sprite);

    return sprite;
  }

  private static createCoin() {
    const size = PARTICLES.texture;
    const half = size / 2;

    return TextureFactory.canvas("coin", size, size, (ctx) => {
      const face = ctx.createRadialGradient(
        half * 0.7,
        half * 0.6,
        1,
        half,
        half,
        half,
      );

      face.addColorStop(0, "#fff7c2");
      face.addColorStop(0.45, "#ffcf3a");
      face.addColorStop(1, "#a86a05");
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.arc(half, half, half - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#7a4a00";
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,240,180,0.8)";
      ctx.beginPath();
      ctx.arc(half, half, half * 0.62, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  private static createGem() {
    const size = PARTICLES.texture;
    const half = size / 2;

    return TextureFactory.canvas("gem", size, size, (ctx) => {
      ctx.fillStyle = "#d9d9d9";
      ctx.beginPath();
      ctx.moveTo(half, 2);
      ctx.lineTo(size - 6, half * 0.8);
      ctx.lineTo(half, size - 2);
      ctx.lineTo(6, half * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(half, 2);
      ctx.lineTo(size - 6, half * 0.8);
      ctx.lineTo(half, half * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#9a9a9a";
      ctx.beginPath();
      ctx.moveTo(half, size - 2);
      ctx.lineTo(6, half * 0.8);
      ctx.lineTo(half, half * 0.8);
      ctx.closePath();
      ctx.fill();
    });
  }
}
