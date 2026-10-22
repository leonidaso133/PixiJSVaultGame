import gsap from "gsap";
import { Circle, Container, Renderer, Sprite } from "pixi.js";
import { DOOR, HANDLE, SWING } from "../config";
import { radialTexture } from "../utils/textures";
import DoorSwing from "./DoorSwing";
import Handle from "./Handle";

export default class Door extends Container {
  label = "Door";

  readonly face = new Container({ label: "DoorFace" });
  readonly closed: Sprite;
  readonly open: Sprite;
  readonly handle: Handle;
  readonly swing: DoorSwing;

  private wallShadow: Sprite;
  private openAmount = 0;
  private timeline?: gsap.core.Timeline;
  private joltTween?: gsap.core.Timeline;

  constructor(renderer: Renderer) {
    super();

    const { hingePivot, shadow } = SWING;

    this.position.set(DOOR.position.x, DOOR.position.y);
    this.hitArea = new Circle(0, 0, DOOR.hitRadius);

    this.closed = Sprite.from("doorClosed");
    this.closed.label = "DoorClosed";
    this.closed.pivot.set(DOOR.closed.pivot.x, DOOR.closed.pivot.y);

    this.open = Sprite.from("doorOpen");
    this.open.label = "DoorOpen";
    this.open.pivot.set(hingePivot.x, hingePivot.y);
    this.open.position.set(
      DOOR.open.offset.x + hingePivot.x,
      DOOR.open.offset.y + hingePivot.y,
    );
    this.open.visible = false;

    this.handle = new Handle();
    this.handle.position.set(HANDLE.offset.x, HANDLE.offset.y);

    this.wallShadow = new Sprite(
      radialTexture(shadow.size, [
        [0, "rgba(0,0,0,1)"],
        [0.55, "rgba(0,0,0,0.6)"],
        [1, "rgba(0,0,0,0)"],
      ]),
    );
    this.wallShadow.label = "DoorWallShadow";
    this.wallShadow.anchor.set(0.5);
    this.wallShadow.position.set(shadow.x, shadow.y);
    this.wallShadow.setSize(shadow.width, shadow.height);
    this.wallShadow.alpha = 0;

    this.swing = new DoorSwing(renderer, this.closed.texture);

    this.face.addChild(this.closed, this.handle);
    this.addChild(this.wallShadow, this.swing, this.open, this.face);
  }

  get openness() {
    return this.openAmount;
  }

  set openness(value: number) {
    this.openAmount = value;
    this.swing.progress = value;
    this.wallShadow.alpha = SWING.shadow.alpha * value * value;
  }

  jolt() {
    const { x, out, back, ease } = DOOR.jolt;

    this.joltTween?.kill();
    this.joltTween = gsap
      .timeline()
      .to(this.face, { x, duration: out, ease: "power2.out" })
      .to(this.face, { x: 0, duration: back, ease });

    return this.joltTween;
  }

  swingOpen() {
    const { crossfade, settle } = SWING;

    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .call(() => this.beginSwing())
      .to(this, { openness: 1, ...SWING.open })
      .addLabel("handoff")
      .set(this.open, { visible: true, alpha: 0 }, "handoff")
      .set(this.open.scale, { x: 1 }, "handoff")
      .to(this.open, { alpha: 1, duration: crossfade }, "handoff")
      .set(this.swing, { visible: false })
      .to(
        this.open.scale,
        { x: settle.scale, duration: settle.out, ease: "sine.out" },
        "handoff",
      )
      .to(this.open.scale, { x: 1, duration: settle.back, ease: settle.ease });

    return this.timeline;
  }

  swingClosed() {
    const { crossfade } = SWING;

    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .call(() => {
        this.openness = 1;
        this.swing.visible = true;
      })
      .to(this.open, { alpha: 0, duration: crossfade })
      .set(this.open, { visible: false })
      .to(this, { openness: 0, ...SWING.close })
      .call(() => this.endSwing());

    return this.timeline;
  }

  private beginSwing() {
    this.joltTween?.kill();
    this.face.x = 0;
    this.swing.bake(this.face);
    this.swing.visible = true;
    this.face.visible = false;
    this.openness = 0;
  }

  private endSwing() {
    this.face.visible = true;
    this.swing.visible = false;
    this.openness = 0;
  }
}
