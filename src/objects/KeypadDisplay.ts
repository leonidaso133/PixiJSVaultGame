import { Container, Graphics, Text } from "pixi.js";
import { KEYPAD } from "../config";

export default class KeypadDisplay extends Container {
  label = "KeypadDisplay";

  readonly text: Text;

  private glass: Graphics;
  private clip: Graphics;

  constructor() {
    super();

    const { x, y, width, height, radius } = KEYPAD.glass;

    this.position.set(x, y);

    this.glass = new Graphics()
      .roundRect(0, 0, width, height, radius)
      .fill({ color: KEYPAD.tint.color, alpha: KEYPAD.tint.alpha });

    this.clip = new Graphics()
      .roundRect(0, 0, width, height, radius)
      .fill(0xffffff);

    this.text = new Text({
      text: KEYPAD.text.initial,
      resolution: KEYPAD.text.resolution,
      style: {
        fontFamily: KEYPAD.text.fontFamily,
        fontSize: KEYPAD.text.fontSize,
        fill: KEYPAD.text.fill,
        dropShadow: {
          color: KEYPAD.text.glow,
          blur: 6,
          distance: 0,
          alpha: 0.9,
        },
      },
    });
    this.text.anchor.set(0.5);
    this.text.position.set(width / 2, height / 2);

    this.addChild(this.glass, this.text, this.clip);
    this.mask = this.clip;
  }

  setText(value: string) {
    this.text.text = value;
  }
}
