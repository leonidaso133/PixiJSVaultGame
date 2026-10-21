import gsap from "gsap";
import { Circle, Container, Sprite } from "pixi.js";
import { DOOR, HANDLE } from "../config";
import Handle from "./Handle";

export default class Door extends Container {
  label = "Door";

  readonly closed: Sprite;
  readonly open: Sprite;
  readonly handle: Handle;

  private timeline?: gsap.core.Timeline;

  constructor() {
    super();

    this.position.set(DOOR.position.x, DOOR.position.y);
    this.hitArea = new Circle(0, 0, DOOR.hitRadius);

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

  swingOpen() {
    return this.transition(this.open, [this.closed, this.handle]);
  }

  swingClosed() {
    return this.transition(this.closed, [this.open], [this.handle]);
  }

  private transition(
    show: Sprite,
    hide: Container[],
    alsoShow: Container[] = [],
  ) {
    const shown = [show, ...alsoShow];

    this.timeline?.kill();
    this.timeline = gsap
      .timeline({ defaults: DOOR.anim })
      .set(shown, { visible: true, alpha: 0 })
      .to(shown, { alpha: 1 }, 0)
      .to(hide, { alpha: 0 }, 0)
      .set(hide, { visible: false });

    return this.timeline;
  }
}
