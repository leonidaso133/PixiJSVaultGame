import gsap from "gsap";
import { Circle, Container, Graphics } from "pixi.js";
import { audio } from "../audio/AudioManager";
import { MUTE } from "../config";
import { Layout } from "../core/Viewport";

export default class MuteButton extends Container {
  label = "MuteButton";

  private icon = new Graphics();
  private waves = new Graphics();
  private cross = new Graphics();

  constructor() {
    super();

    const r = MUTE.size / 2;
    const { color } = MUTE;
    const background = new Graphics()
      .circle(0, 0, r)
      .fill(MUTE.background)
      .stroke({ width: 1.5, color, alpha: 0.6 });

    this.icon.poly([-11, -4, -6, -4, 1, -10, 1, 10, -6, 4, -11, 4]).fill(color);
    this.waves
      .arc(2, 0, 6, -Math.PI / 4, Math.PI / 4)
      .stroke({ width: 2, color, cap: "round" })
      .arc(2, 0, 11, -Math.PI / 4, Math.PI / 4)
      .stroke({ width: 2, color, cap: "round" });
    this.cross
      .moveTo(5, -5)
      .lineTo(13, 5)
      .moveTo(13, -5)
      .lineTo(5, 5)
      .stroke({ width: 2.5, color, cap: "round" });

    this.addChild(background, this.icon, this.waves, this.cross);
    this.eventMode = "static";
    this.cursor = "pointer";
    this.hitArea = new Circle(0, 0, r);

    this.on("pointertap", () => (audio.muted = !audio.muted));
    this.on("pointerover", () => this.hover(true));
    this.on("pointerout", () => this.hover(false));
    audio.on("mute", this.refresh, this);
    this.refresh(audio.muted);
  }

  applyLayout(layout: Layout) {
    const offset = MUTE.margin + MUTE.size / 2;

    this.position.set(layout.screenWidth - offset, offset);
  }

  private hover(on: boolean) {
    const scale = on ? MUTE.hover.scale : 1;

    gsap.to(this.scale, {
      x: scale,
      y: scale,
      duration: MUTE.hover.duration,
      overwrite: "auto",
    });
  }

  private refresh(muted: boolean) {
    this.waves.visible = !muted;
    this.cross.visible = muted;
    gsap.fromTo(
      this.icon.scale,
      { x: 0.8, y: 0.8 },
      { x: 1, y: 1, duration: 0.3, ease: "back.out(3)", overwrite: true },
    );
  }
}
