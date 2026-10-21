import { EventEmitter, FederatedPointerEvent } from "pixi.js";
import { DOOR, DRAG, HANDLE, INPUT } from "../config";
import { Direction } from "../logic/Combination";
import Door from "../objects/Door";

export type StepSource = "drag" | "tap" | "key";

export type Hover = { side: Direction; onHandle: boolean } | null;

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
  hover: [Hover];
  interact: [];
}> {
  canDrag: () => boolean = () => true;

  private enabled = false;
  private press?: Press;
  private hovered: Hover = null;

  constructor(private door: Door) {
    super();

    door.eventMode = "static";
    door.cursor = "pointer";
    door.on("pointerdown", this.onDown, this);
    door.on("globalpointermove", this.onMove, this);
    door.on("pointerup", this.onUp, this);
    door.on("pointerupoutside", this.onUp, this);
    door.on("pointerout", this.onOut, this);
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
    this.setHover(null);
  }

  destroy() {
    window.removeEventListener("keydown", this.onKey);
    this.door.off("pointerdown", this.onDown, this);
    this.door.off("globalpointermove", this.onMove, this);
    this.door.off("pointerup", this.onUp, this);
    this.door.off("pointerupoutside", this.onUp, this);
    this.door.off("pointerout", this.onOut, this);
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
    this.emit("interact");
  }

  private onMove(event: FederatedPointerEvent) {
    const press = this.press;

    this.updateHover(event);

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
      this.setHover(null);
    }

    this.emitCrossings(press);

    if (this.press !== press) return;

    const notch = press.emitted * HANDLE.stepAngle;
    const offset = press.delta - notch;
    const lag =
      Math.sign(offset) *
      DRAG.maxLag *
      (1 - Math.exp(-Math.abs(offset) / DRAG.softness));

    this.door.handle.dragTo(press.base + notch + lag);
  }

  private emitCrossings(press: Press) {
    const step = HANDLE.stepAngle;

    while (this.press === press) {
      const offset = press.delta - press.emitted * step;

      if (offset >= step) {
        press.emitted++;
        this.door.handle.snapThrough();
        this.emit("step", "CW", "drag");
      } else if (offset <= -step) {
        press.emitted--;
        this.door.handle.snapThrough();
        this.emit("step", "CCW", "drag");
      } else return;
    }
  }

  private onUp(event: FederatedPointerEvent) {
    const press = this.press;

    if (!press || press.id !== event.pointerId) return;

    this.press = undefined;
    this.door.cursor = press.onHandle ? "grab" : "pointer";

    if (press.dragging) {
      this.door.handle.snapBack();
      return;
    }

    if (performance.now() - press.time <= INPUT.tapMaxMs) {
      this.emit("step", press.side, "tap");
    }
  }

  private onOut() {
    if (!this.press) this.setHover(null);
  }

  private onKey = (event: KeyboardEvent) => {
    const dir = (Object.keys(INPUT.keys) as Direction[]).find((key) =>
      (INPUT.keys[key] as readonly string[]).includes(event.key),
    );

    if (!dir) return;

    event.preventDefault();
    if (!this.enabled || event.repeat || this.isDragging) return;

    this.emit("interact");
    this.emit("step", dir, "key");
  };

  private updateHover(event: FederatedPointerEvent) {
    if (this.press && !this.press.dragging) return;

    let hover: Hover = null;

    if (this.enabled && !this.press && event.pointerType !== "touch") {
      const local = event.getLocalPosition(this.door);
      const distance = Math.hypot(local.x, local.y);

      if (distance <= DOOR.hitRadius) {
        hover = {
          side: local.x < 0 ? "CCW" : "CW",
          onHandle: distance <= HANDLE.hitRadius,
        };
      }
    }

    this.setHover(hover);
  }

  private setHover(hover: Hover) {
    const current = this.hovered;

    if (
      current?.side === hover?.side &&
      current?.onHandle === hover?.onHandle
    ) {
      return;
    }

    this.hovered = hover;
    if (this.enabled && !this.press) {
      this.door.cursor = hover?.onHandle ? "grab" : "pointer";
    }
    this.emit("hover", hover);
  }

  private pointerAngle(event: FederatedPointerEvent) {
    const hub = this.door.toGlobal({ x: 0, y: 0 });

    return (
      (Math.atan2(event.global.y - hub.y, event.global.x - hub.x) * 180) /
      Math.PI
    );
  }
}
