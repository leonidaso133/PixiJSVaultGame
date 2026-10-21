import { EventEmitter, FederatedPointerEvent } from "pixi.js";
import { HANDLE, INPUT } from "../config";
import { Direction } from "../logic/Combination";
import Door from "../objects/Door";

export type StepSource = "drag" | "tap" | "key";

interface Press {
  id: number;
  time: number;
  side: Direction;
  onHandle: boolean;
  lastAngle: number;
  delta: number;
  emitted: number;
  base: number;
  dragging: boolean;
}

export default class HandleInput extends EventEmitter<{
  step: [Direction, StepSource];
}> {
  canDrag: () => boolean = () => true;

  private enabled = false;
  private press?: Press;

  constructor(private door: Door) {
    super();

    door.eventMode = "static";
    door.cursor = "pointer";
    door.on("pointerdown", this.onDown, this);
    door.on("globalpointermove", this.onMove, this);
    door.on("pointerup", this.onUp, this);
    door.on("pointerupoutside", this.onUp, this);
    window.addEventListener("keydown", this.onKey);
  }

  get isDragging() {
    return this.press?.dragging ?? false;
  }

  enable() {
    this.enabled = true;
    this.door.cursor = "pointer";
  }

  disable() {
    this.enabled = false;
    this.door.cursor = "default";
    if (this.press?.dragging) this.door.handle.snapBack();
    this.press = undefined;
  }

  destroy() {
    window.removeEventListener("keydown", this.onKey);
    this.door.off("pointerdown", this.onDown, this);
    this.door.off("globalpointermove", this.onMove, this);
    this.door.off("pointerup", this.onUp, this);
    this.door.off("pointerupoutside", this.onUp, this);
    this.removeAllListeners();
  }

  private onDown(event: FederatedPointerEvent) {
    if (!this.enabled || this.press) return;

    const local = event.getLocalPosition(this.door);

    this.press = {
      id: event.pointerId,
      time: performance.now(),
      side: local.x < 0 ? "CCW" : "CW",
      onHandle: Math.hypot(local.x, local.y) <= HANDLE.hitRadius,
      lastAngle: this.pointerAngle(event),
      delta: 0,
      emitted: 0,
      base: 0,
      dragging: false,
    };
  }

  private onMove(event: FederatedPointerEvent) {
    const press = this.press;

    if (!press || press.id !== event.pointerId || !press.onHandle) return;

    const angle = this.pointerAngle(event);

    press.delta += ((angle - press.lastAngle + 540) % 360) - 180;
    press.lastAngle = angle;

    if (!press.dragging) {
      if (!this.canDrag()) {
        press.delta = 0;
        return;
      }
      if (Math.abs(press.delta) < INPUT.dragDeadzone) return;

      press.dragging = true;
      press.base = this.door.handle.targetAngle;
      this.door.handle.beginDrag();
      this.door.cursor = "grabbing";
    }

    this.door.handle.dragTo(press.base + press.delta);
    this.emitCrossings(press);
  }

  private emitCrossings(press: Press) {
    const step = HANDLE.stepAngle;

    while (this.press === press) {
      const offset = press.delta - press.emitted * step;

      if (offset >= step) {
        press.emitted++;
        this.emit("step", "CW", "drag");
      } else if (offset <= -step) {
        press.emitted--;
        this.emit("step", "CCW", "drag");
      } else return;
    }
  }

  private onUp(event: FederatedPointerEvent) {
    const press = this.press;

    if (!press || press.id !== event.pointerId) return;

    this.press = undefined;
    this.door.cursor = "pointer";

    if (press.dragging) {
      this.door.handle.snapBack();
      return;
    }

    if (performance.now() - press.time <= INPUT.tapMaxMs) {
      this.emit("step", press.side, "tap");
    }
  }

  private onKey = (event: KeyboardEvent) => {
    const dir = (Object.keys(INPUT.keys) as Direction[]).find((key) =>
      (INPUT.keys[key] as readonly string[]).includes(event.key),
    );

    if (!dir) return;

    event.preventDefault();
    if (!this.enabled || event.repeat || this.isDragging) return;

    this.emit("step", dir, "key");
  };

  private pointerAngle(event: FederatedPointerEvent) {
    const hub = this.door.toGlobal({ x: 0, y: 0 });

    return (
      (Math.atan2(event.global.y - hub.y, event.global.x - hub.x) * 180) /
      Math.PI
    );
  }
}
