import {
  Color,
  Container,
  FillGradient,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";
import { KawaseBlurFilter } from "pixi-filters";
import { BACKDROP, DESIGN } from "../config";
import { Layout } from "../core/Viewport";

type Side = "top" | "bottom" | "left" | "right";

export default class Backdrop extends Container {
  label = "Backdrop";

  private bands: Record<Side, Sprite>;
  private fade = new Graphics();
  private gradients: Record<Side, FillGradient>;

  constructor() {
    super();

    const source = Texture.from("background").source;
    const { band } = BACKDROP;
    const { width, height } = DESIGN;
    const frames: Record<Side, Rectangle> = {
      top: new Rectangle(0, 0, width, band),
      bottom: new Rectangle(0, height - band, width, band),
      left: new Rectangle(0, 0, band, height),
      right: new Rectangle(width - band, 0, band, height),
    };

    this.bands = {} as Record<Side, Sprite>;

    for (const side of Object.keys(frames) as Side[]) {
      const sprite = new Sprite(new Texture({ source, frame: frames[side] }));
      sprite.tint = BACKDROP.tint;
      this.bands[side] = sprite;
      this.addChild(sprite);
    }

    this.gradients = {
      top: this.gradient({ x: 0, y: 1 }, true),
      bottom: this.gradient({ x: 0, y: 1 }, false),
      left: this.gradient({ x: 1, y: 0 }, true),
      right: this.gradient({ x: 1, y: 0 }, false),
    };
    this.addChild(this.fade);

    this.bands.bottom.anchor.y = 1;
    this.bands.right.anchor.x = 1;

    this.filters = [
      new KawaseBlurFilter({
        strength: BACKDROP.blur,
        quality: BACKDROP.quality,
        clamp: true,
      }),
    ];
  }

  applyLayout(layout: Layout) {
    this.visible = !layout.covers;
    if (!this.visible) return;

    const { scale, x, y, screenWidth, screenHeight } = layout;
    const { band, overlap } = BACKDROP;
    const right = x + DESIGN.width * scale;
    const bottom = y + DESIGN.height * scale;
    const { top: t, bottom: b, left: l, right: r } = this.bands;

    t.position.set(x, y + overlap);
    t.scale.set(scale, -(y + overlap * 2) / band);

    b.position.set(x, bottom - overlap);
    b.scale.set(scale, -(screenHeight - bottom + overlap * 2) / band);

    l.position.set(x + overlap, y);
    l.scale.set(-(x + overlap * 2) / band, scale);

    r.position.set(right - overlap, y);
    r.scale.set(-(screenWidth - right + overlap * 2) / band, scale);

    t.visible = b.visible = y > 0;
    l.visible = r.visible = x > 0;

    this.fade.clear();
    if (y > 0) {
      this.fade.rect(0, 0, screenWidth, y).fill(this.gradients.top);
      this.fade
        .rect(0, bottom, screenWidth, screenHeight - bottom)
        .fill(this.gradients.bottom);
    }
    if (x > 0) {
      this.fade.rect(0, 0, x, screenHeight).fill(this.gradients.left);
      this.fade
        .rect(right, 0, screenWidth - right, screenHeight)
        .fill(this.gradients.right);
    }
  }

  private gradient(end: { x: number; y: number }, outerFirst: boolean) {
    const outer = new Color(BACKDROP.fade.color).setAlpha(BACKDROP.fade.alpha);
    const inner = new Color(BACKDROP.fade.color).setAlpha(0);

    return new FillGradient({
      type: "linear",
      start: { x: 0, y: 0 },
      end,
      textureSpace: "local",
      colorStops: [
        { offset: 0, color: outerFirst ? outer : inner },
        { offset: 1, color: outerFirst ? inner : outer },
      ],
    });
  }
}
