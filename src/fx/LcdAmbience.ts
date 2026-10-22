import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import { AMBIENCE, KEYPAD } from "../config";
import KeypadDisplay from "../objects/KeypadDisplay";
import TextureFactory from "./TextureFactory";

const random = gsap.utils.random;

export default class LcdAmbience {
  readonly keys: Sprite;

  private overlay = new Container({ label: "LcdOverlay" });
  private scan: Sprite;
  private loops: gsap.core.Animation[] = [];

  constructor(keypad: KeypadDisplay) {
    const { width, height } = KEYPAD.glass;
    const { keys, scanlines, scan } = AMBIENCE.keypad;

    const lines = new Sprite(
      TextureFactory.canvas("scanlines", width, height, (ctx) => {
        ctx.fillStyle = "#000";
        for (let y = 0; y < height; y += scanlines.gap)
          ctx.fillRect(0, y, width, 1);
      }),
    );

    lines.alpha = scanlines.alpha;

    this.scan = new Sprite(TextureFactory.softDot());
    this.scan.anchor.set(0.5);
    this.scan.setSize(width * 1.6, scan.height);
    this.scan.position.set(width / 2, -scan.height);
    this.scan.tint = KEYPAD.text.fill;
    this.scan.blendMode = "add";
    this.scan.alpha = scan.alpha;

    this.overlay.eventMode = "none";
    this.overlay.addChild(lines, this.scan);
    this.overlay.visible = false;
    keypad.addOverlay(this.overlay);

    this.keys = new Sprite(TextureFactory.softDot());
    this.keys.label = "KeypadGlow";
    this.keys.anchor.set(0.5);
    this.keys.position.set(keys.x + keys.width / 2, keys.y + keys.height / 2);
    this.keys.setSize(keys.width * 1.5, keys.height * 1.4);
    this.keys.tint = keys.color;
    this.keys.blendMode = "add";
    this.keys.alpha = 0;
  }

  start() {
    const { pulse, scan, flicker } = AMBIENCE.keypad;
    const { height } = KEYPAD.glass;

    this.loops.forEach((loop) => loop.kill());
    this.overlay.visible = true;

    const blink = gsap.timeline({
      repeat: -1,
      repeatRefresh: true,
      repeatDelay: random(flicker.rest.min, flicker.rest.max),
      onRepeat: () =>
        blink.repeatDelay(random(flicker.rest.min, flicker.rest.max)),
    });

    blink
      .to(this.overlay, {
        alpha: () => random(flicker.min, 0.97),
        duration: flicker.step,
        ease: "steps(1)",
      })
      .to(this.overlay, { alpha: 1, duration: flicker.step, ease: "steps(1)" });

    this.loops = [
      gsap.fromTo(
        this.keys,
        { alpha: pulse.min },
        {
          alpha: pulse.max,
          duration: pulse.duration,
          ease: pulse.ease,
          yoyo: true,
          repeat: -1,
        },
      ),
      gsap.fromTo(
        this.scan,
        { y: -scan.height },
        {
          y: height + scan.height,
          duration: scan.duration,
          ease: "none",
          repeat: -1,
          repeatDelay: scan.rest,
        },
      ),
      blink,
    ];
  }

  pause() {
    this.loops.forEach((loop) => loop.pause());
  }

  resume() {
    this.loops.forEach((loop) => loop.resume());
  }
}
