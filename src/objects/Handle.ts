import { Container, Sprite } from "pixi.js";
import { HANDLE, SHADOW } from "../config";

export default class Handle extends Container {
  label = "Handle";

  readonly wheel: Sprite;
  readonly shadow: Sprite;

  steps = 0;

  private degrees = 0;

  constructor() {
    super();

    this.shadow = Sprite.from("doorHandleShadow");
    this.shadow.label = "HandleShadow";
    this.shadow.pivot.set(SHADOW.pivot.x, SHADOW.pivot.y);
    this.shadow.position.set(SHADOW.offset.x, SHADOW.offset.y);

    this.wheel = Sprite.from("doorHandle");
    this.wheel.label = "HandleWheel";
    this.wheel.pivot.set(HANDLE.pivot.x, HANDLE.pivot.y);

    this.addChild(this.shadow, this.wheel);
  }

  override get angle() {
    return this.degrees;
  }

  override set angle(value: number) {
    this.degrees = value;
    this.wheel.angle = value;
    this.shadow.angle = value;
  }
}
