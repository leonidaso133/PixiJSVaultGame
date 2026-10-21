import { Container, Sprite } from "pixi.js";

export default class Background extends Container {
  label = "Background";

  readonly sprite: Sprite;

  constructor() {
    super();

    this.sprite = Sprite.from("background");
    this.addChild(this.sprite);
  }
}
