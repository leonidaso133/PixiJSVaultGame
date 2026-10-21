import gsap from "gsap";
import { Container, Sprite } from "pixi.js";
import { HANDLE, SHADOW } from "../config";
import { Direction } from "../logic/Combination";

export default class Handle extends Container {
  label = "Handle";

  readonly wheel: Sprite;
  readonly shadow: Sprite;

  steps = 0;

  private degrees = 0;
  private tween?: gsap.core.Tween | gsap.core.Timeline;
  private follow?: gsap.QuickToFunc;

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

  get targetAngle() {
    return this.steps * HANDLE.stepAngle;
  }

  get isAnimating() {
    return this.tween?.isActive() ?? false;
  }

  rotateStep(dir: Direction) {
    this.commitStep(dir);

    return this.animateTo(this.targetAngle, HANDLE.step);
  }

  commitStep(dir: Direction) {
    this.steps += dir === "CW" ? 1 : -1;
  }

  beginDrag() {
    this.stop();
    this.follow = gsap.quickTo(this, "angle", HANDLE.follow);
  }

  dragTo(angle: number) {
    this.follow?.(angle);
  }

  snapBack() {
    return this.animateTo(this.targetAngle, HANDLE.snap);
  }

  spinCrazy() {
    const { minTurns, maxTurns, duration, ease } = HANDLE.spin;
    const turns = gsap.utils.random(minTurns, maxTurns, 1);
    const sign = Math.random() < 0.5 ? 1 : -1;
    const stepsPerTurn = 360 / HANDLE.stepAngle;

    this.steps += sign * turns * stepsPerTurn;

    return this.animateTo(this.targetAngle, { duration, ease });
  }

  normalize() {
    const stepsPerTurn = 360 / HANDLE.stepAngle;

    this.stop();
    this.steps = ((this.steps % stepsPerTurn) + stepsPerTurn) % stepsPerTurn;
    this.angle = this.targetAngle;
  }

  private animateTo(angle: number, vars: { duration: number; ease: string }) {
    this.stop();
    this.tween = gsap.to(this, { angle, ...vars });

    return this.tween;
  }

  private stop() {
    this.tween?.kill();
    this.follow?.tween.kill();
    this.follow = undefined;
  }
}
