import gsap from "gsap";
import {
  CanvasTextMetrics,
  Container,
  Graphics,
  Text,
  TextStyle,
} from "pixi.js";
import { KEYPAD } from "../config";
import Timer from "../logic/Timer";
import ProgressLeds from "./ProgressLeds";

export default class KeypadDisplay extends Container {
  label = "KeypadDisplay";

  readonly leds: ProgressLeds;
  readonly message: Text;

  private glass: Graphics;
  private clip: Graphics;
  private digits = new Container({ label: "LcdDigits" });
  private cells: Text[] = [];
  private value: string = KEYPAD.text.initial;
  private held = false;
  private blink?: gsap.core.Tween;
  private roll?: gsap.core.Timeline;

  constructor() {
    super();

    const { x, y, width, height, radius } = KEYPAD.glass;
    const { fontFamily, fontSize, fill, glow, initial } = KEYPAD.text;

    this.position.set(x, y);

    this.glass = new Graphics()
      .roundRect(0, 0, width, height, radius)
      .fill({ color: KEYPAD.tint.color, alpha: KEYPAD.tint.alpha });

    this.clip = new Graphics()
      .roundRect(0, 0, width, height, radius)
      .fill(0xffffff);

    const cellWidth =
      CanvasTextMetrics.measureText(
        initial,
        new TextStyle({ fontFamily, fontSize }),
      ).width / initial.length;
    const startX = width / 2 - (cellWidth * initial.length) / 2;

    for (let i = 0; i < initial.length; i++) {
      const cell = this.createText(initial[i], fill, glow);

      cell.position.set(startX + cellWidth * (i + 0.5), KEYPAD.text.y);
      this.cells.push(cell);
      this.digits.addChild(cell);
    }

    this.message = this.createText(
      KEYPAD.error.text,
      KEYPAD.error.fill,
      KEYPAD.error.glow,
    );
    this.message.position.set(width / 2, KEYPAD.text.y);
    this.message.visible = false;

    this.leds = new ProgressLeds(width);

    this.addChild(this.glass, this.digits, this.message, this.leds, this.clip);
    this.mask = this.clip;
  }

  get text() {
    return this.value;
  }

  setText(value: string) {
    if (this.held || value === this.value) return;

    this.write(value);
  }

  setTime(seconds: number) {
    this.setText(Timer.format(seconds));
  }

  showError() {
    const { blinks } = KEYPAD.error;

    this.held = true;
    this.roll?.kill();
    this.blink?.kill();
    this.cells.forEach((cell) => (cell.visible = false));
    this.message.visible = true;
    this.blink = gsap.fromTo(
      this.message,
      { alpha: 1 },
      {
        alpha: 0.1,
        duration: 1 / blinks,
        ease: "steps(1)",
        yoyo: true,
        repeat: -1,
      },
    );
  }

  rollTo(value: string) {
    const { duration, stagger, ease } = KEYPAD.roll;
    const roll = gsap.timeline({
      onComplete: () => {
        this.value = value;
        this.held = false;
      },
    });

    this.roll?.kill();
    this.roll = roll;
    roll.call(() => {
      this.paint(KEYPAD.text.fill, KEYPAD.text.glow);
      this.blink?.kill();
      this.message.visible = false;
      this.cells.forEach((cell) => (cell.visible = true));
    });

    this.cells.forEach((cell, i) => {
      const at = i * stagger;

      roll
        .to(cell.scale, { y: 0, duration, ease }, at)
        .call(() => (cell.text = value[i] ?? ""), [], at + duration)
        .to(cell.scale, { y: 1, duration, ease: "back.out(2)" }, at + duration);
    });

    return roll;
  }

  celebrate() {
    const { flash, fill, glow } = KEYPAD.celebrate;

    this.roll?.kill();
    this.roll = gsap
      .timeline()
      .call(() => this.paint(flash.fill, flash.glow))
      .fromTo(
        this.digits,
        { alpha: 1 },
        {
          alpha: 0.15,
          duration: flash.duration,
          ease: "steps(1)",
          yoyo: true,
          repeat: flash.times * 2 - 1,
          immediateRender: false,
        },
      )
      .call(() => this.paint(fill, glow))
      .set(this.digits, { alpha: 1 });

    return this.roll;
  }

  reset(value: string) {
    this.blink?.kill();
    this.roll?.kill();
    this.held = false;
    this.digits.alpha = 1;
    this.paint(KEYPAD.text.fill, KEYPAD.text.glow);
    this.message.visible = false;
    this.cells.forEach((cell) => {
      cell.visible = true;
      cell.scale.y = 1;
    });
    this.write(value);
  }

  private write(value: string) {
    this.value = value;
    this.cells.forEach((cell, i) => {
      const char = value[i] ?? "";

      if (cell.text !== char) cell.text = char;
    });
  }

  private paint(fill: number, glow: number) {
    this.cells.forEach((cell) => {
      if (cell.style.fill === fill) return;

      cell.style.fill = fill;
      cell.style.dropShadow = KeypadDisplay.glow(glow);
    });
  }

  private createText(text: string, fill: number, glow: number) {
    const { fontFamily, fontSize, resolution } = KEYPAD.text;
    const label = new Text({
      text,
      resolution,
      style: {
        fontFamily,
        fontSize,
        fill,
        dropShadow: KeypadDisplay.glow(glow),
      },
    });

    label.anchor.set(0.5);

    return label;
  }

  private static glow(color: number) {
    return { color, blur: 6, distance: 0, alpha: 0.9, angle: 0 };
  }
}
