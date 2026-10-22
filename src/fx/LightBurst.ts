import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import { LIGHT, TREASURE } from "../config";
import TextureFactory from "./TextureFactory";

export default class LightBurst extends Container {
  label = "LightBurst";

  private rays: Sprite;
  private glow: Sprite;
  private timeline?: gsap.core.Timeline;
  private spin?: gsap.core.Tween;

  constructor() {
    super();

    const { rays, glow } = LIGHT;

    this.eventMode = "none";
    this.position.set(TREASURE.center.x, TREASURE.center.y);

    this.glow = new Sprite(
      TextureFactory.radial("lightGlow", glow.texture, [
        [0, `rgba(${glow.color},1)`],
        [0.35, `rgba(${glow.color},0.45)`],
        [1, `rgba(${glow.color},0)`],
      ]),
    );
    this.rays = new Sprite(LightBurst.createRays());

    [this.glow, this.rays].forEach((sprite) => {
      sprite.anchor.set(0.5);
      sprite.blendMode = "add";
      sprite.alpha = 0;
    });
    this.glow.setSize(glow.size);
    this.rays.setSize(rays.size);

    this.addChild(this.glow, this.rays);
    this.visible = false;
  }

  burst() {
    const { rays, glow, in: rise, settle } = LIGHT;
    const grow = (rays.size / this.rays.texture.width) * rays.grow;

    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .call(() => {
        this.visible = true;
        this.startSpin();
      })
      .to(this.rays, { alpha: rays.peak, duration: rise, ease: "power2.out" })
      .to(
        this.glow,
        { alpha: glow.peak, duration: rise, ease: "power2.out" },
        0,
      )
      .to(
        this.rays.scale,
        { x: grow, y: grow, duration: rise + settle, ease: "power2.out" },
        0,
      )
      .to(this.rays, { alpha: rays.rest, duration: settle, ease: "sine.inOut" })
      .to(
        this.glow,
        { alpha: glow.rest, duration: settle, ease: "sine.inOut" },
        "<",
      );

    return this.timeline;
  }

  dim() {
    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .to([this.rays, this.glow], {
        alpha: 0,
        duration: LIGHT.dim,
        ease: "power2.in",
      })
      .call(() => {
        this.spin?.kill();
        this.rays.setSize(LIGHT.rays.size);
        this.visible = false;
      });

    return this.timeline;
  }

  private startSpin() {
    this.spin?.kill();
    this.rays.angle = 0;
    this.rays.setSize(LIGHT.rays.size);
    this.spin = gsap.to(this.rays, {
      angle: 360,
      duration: LIGHT.rays.period,
      ease: "none",
      repeat: -1,
    });
  }

  private static createRays() {
    const { texture, count, color } = LIGHT.rays;
    const half = texture / 2;

    return TextureFactory.canvas("lightRays", texture, texture, (ctx) => {
      const gradient = ctx.createRadialGradient(
        half,
        half,
        0,
        half,
        half,
        half,
      );

      gradient.addColorStop(0, `rgba(${color},0.9)`);
      gradient.addColorStop(0.25, `rgba(${color},0.5)`);
      gradient.addColorStop(1, `rgba(${color},0)`);
      ctx.filter = "blur(4px)";
      ctx.fillStyle = gradient;
      ctx.beginPath();

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const width = (Math.PI / count) * gsap.utils.random(0.25, 0.7);

        ctx.moveTo(half, half);
        ctx.arc(half, half, half * 0.96, angle - width / 2, angle + width / 2);
        ctx.closePath();
      }

      ctx.fill();
    });
  }
}
