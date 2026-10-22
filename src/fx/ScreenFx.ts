import gsap from "gsap";
import { Container, Sprite, Texture } from "pixi.js";
import { FX } from "../config";
import { Layout } from "../core/Viewport";
import { canvasTexture } from "../utils/textures";

export interface ShakeOptions {
  strength: number;
  duration: number;
}

export default class ScreenFx extends Container {
  label = "ScreenFx";

  private vignetteSprite: Sprite;
  private flashSprite: Sprite;
  private vignetteTween?: gsap.core.Timeline;
  private flashTween?: gsap.core.Timeline;
  private shakeTween?: gsap.core.Tween;

  constructor() {
    super();

    this.eventMode = "none";
    this.vignetteSprite = new Sprite(ScreenFx.createVignette());
    this.vignetteSprite.alpha = 0;
    this.vignetteSprite.visible = false;

    this.flashSprite = new Sprite(Texture.WHITE);
    this.flashSprite.tint = FX.flash.color;
    this.flashSprite.blendMode = "add";
    this.flashSprite.alpha = 0;
    this.flashSprite.visible = false;

    this.addChild(this.vignetteSprite, this.flashSprite);
  }

  applyLayout(layout: Layout) {
    this.vignetteSprite.setSize(layout.screenWidth, layout.screenHeight);
    this.flashSprite.setSize(layout.screenWidth, layout.screenHeight);
  }

  vignette() {
    const { peak, in: fadeIn, out } = FX.vignette;

    this.vignetteTween?.kill();
    this.vignetteTween = this.pulse(this.vignetteSprite, peak, fadeIn, out);

    return this.vignetteTween;
  }

  flash() {
    const { peak, in: fadeIn, out } = FX.flash;

    this.flashTween?.kill();
    this.flashTween = this.pulse(this.flashSprite, peak, fadeIn, out);

    return this.flashTween;
  }

  shake(target: Container, options: ShakeOptions = FX.shake) {
    const { strength, duration } = options;
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

  private pulse(sprite: Sprite, peak: number, fadeIn: number, out: number) {
    return gsap
      .timeline()
      .set(sprite, { visible: true, alpha: 0 })
      .to(sprite, { alpha: peak, duration: fadeIn, ease: "power2.out" })
      .to(sprite, { alpha: 0, duration: out, ease: "power2.in" })
      .set(sprite, { visible: false });
  }

  private static createVignette() {
    const { size, inner, color } = FX.vignette;
    const half = size / 2;

    return canvasTexture(size, size, (ctx) => {
      const gradient = ctx.createRadialGradient(
        half,
        half,
        half * inner,
        half,
        half,
        half * Math.SQRT2,
      );

      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    });
  }
}
