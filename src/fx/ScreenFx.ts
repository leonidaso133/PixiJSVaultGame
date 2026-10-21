import gsap from "gsap";
import { Container, Sprite, Texture } from "pixi.js";
import { FX } from "../config";
import { Layout } from "../core/Viewport";

export default class ScreenFx extends Container {
  label = "ScreenFx";

  private vignetteSprite: Sprite;
  private vignetteTween?: gsap.core.Timeline;
  private shakeTween?: gsap.core.Tween;

  constructor() {
    super();

    this.eventMode = "none";
    this.vignetteSprite = new Sprite(ScreenFx.createVignette());
    this.vignetteSprite.alpha = 0;
    this.vignetteSprite.visible = false;
    this.addChild(this.vignetteSprite);
  }

  applyLayout(layout: Layout) {
    this.vignetteSprite.setSize(layout.screenWidth, layout.screenHeight);
  }

  vignette() {
    const { peak, in: fadeIn, out } = FX.vignette;
    const sprite = this.vignetteSprite;

    this.vignetteTween?.kill();
    this.vignetteTween = gsap
      .timeline()
      .set(sprite, { visible: true, alpha: 0 })
      .to(sprite, { alpha: peak, duration: fadeIn, ease: "power2.out" })
      .to(sprite, { alpha: 0, duration: out, ease: "power2.in" })
      .set(sprite, { visible: false });

    return this.vignetteTween;
  }

  shake(target: Container) {
    const { strength, duration } = FX.shake;
    const state = { power: 1 };

    this.shakeTween?.kill();
    this.shakeTween = gsap.to(state, {
      power: 0,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        const range = strength * state.power;

        target.position.set(
          gsap.utils.random(-range, range),
          gsap.utils.random(-range, range),
        );
      },
      onComplete: () => target.position.set(0, 0),
    });

    return this.shakeTween;
  }

  private static createVignette() {
    const { size, inner, color } = FX.vignette;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const half = size / 2;
    const gradient = ctx.createRadialGradient(
      half,
      half,
      half * inner,
      half,
      half,
      half * Math.SQRT2,
    );

    canvas.width = size;
    canvas.height = size;
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return Texture.from(canvas);
  }
}
