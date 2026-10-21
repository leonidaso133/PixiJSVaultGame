import { Container, Sprite } from "pixi.js";
import { DOOR, HANDLE } from "../config";
import Handle from "./Handle";

export default class Door extends Container {
  label = "Door";

  readonly closed: Sprite;
  readonly open: Sprite;
  readonly handle: Handle;

  constructor() {
    super();

    this.position.set(DOOR.position.x, DOOR.position.y);

    this.closed = Sprite.from("doorClosed");
    this.closed.label = "DoorClosed";
    this.closed.pivot.set(DOOR.closed.pivot.x, DOOR.closed.pivot.y);

    this.open = Sprite.from("doorOpen");
    this.open.label = "DoorOpen";
    this.open.position.set(DOOR.open.offset.x, DOOR.open.offset.y);
    this.open.visible = false;

    this.handle = new Handle();
    this.handle.position.set(HANDLE.offset.x, HANDLE.offset.y);

    this.addChild(this.open, this.closed, this.handle);
  }
}
