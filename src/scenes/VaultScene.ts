import { Container } from "pixi.js";
import { Layout } from "../core/Viewport";
import Background from "../objects/Background";
import DirectionArrows from "../objects/DirectionArrows";
import Door from "../objects/Door";
import KeypadDisplay from "../objects/KeypadDisplay";

export default class VaultScene extends Container {
  label = "VaultScene";

  readonly camera = new Container({ label: "Camera" });
  readonly backgroundLayer = new Container({ label: "BackgroundLayer" });
  readonly doorLayer = new Container({ label: "DoorLayer" });
  readonly uiLayer = new Container({ label: "UILayer" });
  readonly fxLayer = new Container({ label: "FXLayer" });

  readonly background: Background;
  readonly door: Door;
  readonly keypad: KeypadDisplay;
  readonly arrows: DirectionArrows;

  constructor() {
    super();

    this.background = new Background();
    this.door = new Door();
    this.keypad = new KeypadDisplay();
    this.arrows = new DirectionArrows();

    this.backgroundLayer.addChild(this.background);
    this.doorLayer.addChild(this.door);
    this.uiLayer.addChild(this.keypad, this.arrows);

    this.camera.addChild(
      this.backgroundLayer,
      this.doorLayer,
      this.uiLayer,
      this.fxLayer,
    );
    this.addChild(this.camera);
  }

  applyLayout(layout: Layout) {
    this.scale.set(layout.scale);
    this.position.set(layout.x, layout.y);
  }
}
