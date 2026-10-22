import gsap from "gsap";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { LOADER } from "../config";
import { Layout } from "../core/Viewport";
import TextureFactory from "../fx/TextureFactory";

export default class Loader extends Container {
  label = "Loader";

  private percent: Text;
  private fill = new Graphics();
  private tip: Sprite;
  private shown = { value: 0 };
  private ease: gsap.QuickToFunc;

  constructor() {
    super();

    const { fontFamily, fontSize, fill, glow, label, bar } = LOADER;
    const dropShadow = { color: glow, blur: 8, distance: 0, alpha: 0.9 };

    this.percent = new Text({
      text: "000%",
      resolution: 2,
      style: { fontFamily, fontSize, fill, dropShadow },
    });
    this.percent.anchor.set(0.5);

    const caption = new Text({
      text: label.text,
      resolution: 2,
      style: {
        fontFamily,
        fontSize: label.fontSize,
        letterSpacing: label.letterSpacing,
        fill,
        dropShadow,
      },
    });

    caption.anchor.set(0.5);
    caption.y = label.y;
    caption.alpha = 0.7;

    const track = new Graphics()
      .roundRect(-bar.width / 2, bar.y, bar.width, bar.height, bar.radius)
      .fill(bar.track);

    this.tip = new Sprite(TextureFactory.softDot());
    this.tip.anchor.set(0.5);
    this.tip.setSize(bar.height * 10);
    this.tip.tint = glow;
    this.tip.blendMode = "add";
    this.tip.y = bar.y + bar.height / 2;

    this.addChild(caption, this.percent, track, this.fill, this.tip);
    this.ease = gsap.quickTo(this.shown, "value", {
      ...LOADER.ease,
      onUpdate: () => this.draw(),
    });
    this.draw();
  }

  progress(value: number) {
    this.ease(Math.max(value, this.shown.value));
  }

  finish() {
    const { fill, blinks, blink, fade } = LOADER.finish;

    this.ease.tween.kill();

    return gsap
      .timeline()
      .to(this.shown, {
        value: 1,
        duration: fill,
        ease: "power2.out",
        onUpdate: () => this.draw(),
      })
      .to(this.percent, {
        alpha: 0.2,
        duration: blink,
        ease: "steps(1)",
        yoyo: true,
        repeat: blinks * 2 - 1,
      })
      .to(this, { alpha: 0, duration: fade, ease: "power2.in" });
  }

  applyLayout(layout: Layout) {
    this.position.set(layout.screenWidth / 2, layout.screenHeight / 2);
  }

  private draw() {
    const { bar, fill } = LOADER;
    const value = this.shown.value;
    const width = bar.width * value;
    const text = `${String(Math.round(value * 100)).padStart(3, "0")}%`;

    if (this.percent.text !== text) this.percent.text = text;
    this.fill
      .clear()
      .roundRect(
        -bar.width / 2,
        bar.y,
        Math.max(width, 0.01),
        bar.height,
        bar.radius,
      )
      .fill(fill);
    this.tip.x = -bar.width / 2 + width;
  }
}
