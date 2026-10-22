import gsap from "gsap";
import { Container, Renderer } from "pixi.js";
import { PUSH, TREASURE } from "../config";
import { Layout } from "../core/Viewport";
import LightBurst from "../fx/LightBurst";
import ParticleBurst from "../fx/ParticleBurst";
import Background from "../objects/Background";
import DirectionArrows from "../objects/DirectionArrows";
import Door from "../objects/Door";
import KeypadDisplay from "../objects/KeypadDisplay";
import TreasureLayer from "../objects/TreasureLayer";
import WinBanner from "../ui/WinBanner";

export default class VaultScene extends Container {
  label = "VaultScene";

  readonly lens = new Container({ label: "Lens" });
  readonly camera = new Container({ label: "Camera" });
  readonly backgroundLayer = new Container({ label: "BackgroundLayer" });
  readonly doorLayer = new Container({ label: "DoorLayer" });
  readonly uiLayer = new Container({ label: "UILayer" });
  readonly fxLayer = new Container({ label: "FXLayer" });

  readonly background: Background;
  readonly treasure: TreasureLayer;
  readonly door: Door;
  readonly keypad: KeypadDisplay;
  readonly arrows: DirectionArrows;
  readonly light: LightBurst;
  readonly particles: ParticleBurst;
  readonly banner: WinBanner;

  private layout?: Layout;
  private pushAmount = 0;
  private pushTween?: gsap.core.Tween;

  constructor(renderer: Renderer) {
    super();

    this.background = new Background();
    this.treasure = new TreasureLayer();
    this.door = new Door(renderer);
    this.keypad = new KeypadDisplay();
    this.arrows = new DirectionArrows();
    this.light = new LightBurst();
    this.particles = new ParticleBurst();
    this.banner = new WinBanner();

    this.backgroundLayer.addChild(this.background);
    this.doorLayer.addChild(this.door);
    this.fxLayer.addChild(this.particles);
    this.uiLayer.addChild(this.keypad, this.arrows, this.banner);

    this.camera.addChild(
      this.backgroundLayer,
      this.treasure,
      this.light,
      this.doorLayer,
      this.fxLayer,
      this.uiLayer,
    );
    this.lens.pivot.set(TREASURE.center.x, TREASURE.center.y);
    this.lens.position.set(TREASURE.center.x, TREASURE.center.y);
    this.lens.addChild(this.camera);
    this.addChild(this.lens);
  }

  get push() {
    return this.pushAmount;
  }

  set push(value: number) {
    this.pushAmount = value;
    this.applyLens();
  }

  pushTo(value: number, options: { duration: number; ease: string }) {
    this.pushTween?.kill();
    this.pushTween = gsap.to(this, { push: value, ...options });

    return this.pushTween;
  }

  applyLayout(layout: Layout) {
    this.layout = layout;
    this.scale.set(layout.scale);
    this.position.set(layout.x, layout.y);
    this.applyLens();
  }

  private applyLens() {
    const zoom = 1 + (PUSH.scale - 1) * this.pushAmount;

    this.lens.scale.set(Math.max(1, Math.min(zoom, this.maxZoom())));
  }

  private maxZoom() {
    if (!this.layout) return 1;

    const { scale, x, y, screenWidth, screenHeight } = this.layout;
    const { keep } = PUSH;
    const { x: cx, y: cy } = TREASURE.center;

    return Math.min(
      (cx + x / scale) / (cx - keep.x),
      (screenWidth / scale - x / scale - cx) / (keep.x + keep.width - cx),
      (cy + y / scale) / (cy - keep.y),
      (screenHeight / scale - y / scale - cy) / (keep.y + keep.height - cy),
    );
  }
}
