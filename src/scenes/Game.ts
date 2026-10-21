import gsap from "gsap";
import { Container, Sprite, Text } from "pixi.js";
import { SceneUtils } from "../core/App";
import { centerObjects } from "../utils/misc";

export default class Game extends Container {
  label = "Game";

  private background!: Sprite;

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    const text = new Text({
      text: "Loading...",
      style: { fontFamily: "Verdana", fontSize: 50, fill: "white" },
      resolution: 2,
    });

    centerObjects(text);
    text.anchor.set(0.5);

    this.addChild(text);

    await this.utils.assetLoader.loadAssets();
  }

  start() {
    this.removeChildren();

    this.background = Sprite.from("background");
    this.background.anchor.set(0.5);
    this.addChild(this.background);

    this.onResize(window.innerWidth, window.innerHeight);

    gsap.from(this.background, { alpha: 0, duration: 0.8, ease: "power2.out" });
  }

  update(_delta: number) {}

  onResize(width: number, height: number) {
    if (!this.background) return;

    const scale = Math.max(
      width / this.background.texture.width,
      height / this.background.texture.height,
    );

    this.background.scale.set(scale);
    this.background.position.set(width / 2, height / 2);
  }
}
