import gsap from "gsap";
import { ColorMatrixFilter, Container, Filter, Sprite } from "pixi.js";
import { RadialBlurFilter } from "pixi-filters";
import { audio, Whoosh } from "../audio/AudioManager";
import { HANDLE, SHADOW } from "../config";
import { Direction } from "../logic/Combination";
import Deferred from "../utils/Deferred";

export default class Handle extends Container {
  label = "Handle";

  readonly wheel: Sprite;
  readonly shadow: Sprite;

  steps = 0;

  private degrees = 0;
  private wobbleDegrees = 0;
  private liftAmount = 0;
  private shineAmount = 0;
  private hovered = false;
  private tween?: gsap.core.Tween | gsap.core.Timeline;
  private follow?: gsap.QuickToFunc;
  private hoverTween?: gsap.core.Timeline;
  private punch?: gsap.core.Tween;
  private brightness = new ColorMatrixFilter({ resolution: "inherit" });
  private blurs = [this.createBlur(), this.createBlur()] as const;
  private blurring = false;
  private whoosh?: Whoosh;

  constructor() {
    super();

    this.shadow = Sprite.from("doorHandleShadow");
    this.shadow.label = "HandleShadow";
    this.shadow.pivot.set(SHADOW.pivot.x, SHADOW.pivot.y);

    this.wheel = Sprite.from("doorHandle");
    this.wheel.label = "HandleWheel";
    this.wheel.pivot.set(HANDLE.pivot.x, HANDLE.pivot.y);

    this.addChild(this.shadow, this.wheel);
    this.lift = 0;
  }

  override get angle() {
    return this.degrees;
  }

  override set angle(value: number) {
    this.degrees = value;
    this.applyAngle();
  }

  get wobble() {
    return this.wobbleDegrees;
  }

  set wobble(value: number) {
    this.wobbleDegrees = value;
    this.applyAngle();
  }

  get lift() {
    return this.liftAmount;
  }

  set lift(value: number) {
    const grow = 1 + (SHADOW.lift.offset - 1) * value;

    this.liftAmount = value;
    this.shadow.position.set(SHADOW.offset.x * grow, SHADOW.offset.y * grow);
    this.shadow.alpha = 1 - SHADOW.lift.alpha * value;
  }

  get shine() {
    return this.shineAmount;
  }

  set shine(value: number) {
    this.shineAmount = value;
    this.brightness.brightness(
      1 + (HANDLE.hover.brightness - 1) * value,
      false,
    );
    this.syncFilters();
  }

  get targetAngle() {
    return this.steps * HANDLE.stepAngle;
  }

  get isAnimating() {
    return this.tween?.isActive() ?? false;
  }

  rotateStep(dir: Direction, chained = false) {
    const { anticipation } = HANDLE;
    const { notch, ...drive } = HANDLE.drive;
    const { angle: settleAngle, ...settle } = HANDLE.settle;
    const sign = dir === "CW" ? 1 : -1;
    const half = drive.duration / 2;
    const landed = new Deferred<void>();

    this.commitStep(dir);
    this.stop();
    this.setHover(false);

    const target = this.targetAngle;
    const timeline = gsap.timeline({
      onComplete: () => {
        this.tween = gsap.to(this, { angle: target, ...settle });
      },
      onInterrupt: () => landed.resolve(),
    });

    if (!chained) {
      timeline.to(this, {
        angle: this.degrees - sign * anticipation.angle,
        duration: anticipation.duration,
        ease: anticipation.ease,
      });
    }

    timeline
      .addLabel("drive")
      .to(this, { angle: target + sign * settleAngle, ...drive }, "drive")
      .to(
        this.scale,
        {
          x: HANDLE.squash,
          y: HANDLE.squash,
          duration: half,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        },
        "drive",
      )
      .to(
        this,
        { lift: 1, duration: half, ease: "sine.inOut", yoyo: true, repeat: 1 },
        "drive",
      )
      .call(
        () => {
          audio.play("tick");
          landed.resolve();
        },
        [],
        `drive+=${drive.duration * notch}`,
      );

    this.tween = timeline;

    return landed.promise;
  }

  commitStep(dir: Direction) {
    this.steps += dir === "CW" ? 1 : -1;
  }

  beginDrag() {
    this.stop();
    this.setHover(false);
    this.follow = gsap.quickTo(this, "angle", HANDLE.follow);
  }

  dragTo(angle: number) {
    this.follow?.(angle);
  }

  snapThrough() {
    const { punch, duration, ease } = HANDLE.snapThrough;

    this.punch?.kill();
    this.punch = gsap.fromTo(
      this.scale,
      { x: punch, y: punch },
      { x: 1, y: 1, duration, ease },
    );
    audio.play("tick");
  }

  snapBack() {
    this.stop();
    this.tween = gsap.to(this, { angle: this.targetAngle, ...HANDLE.snap });

    return this.tween;
  }

  setHover(on: boolean) {
    if (on === this.hovered || (on && this.isAnimating)) return;

    const { wobble, period, fade, ease } = HANDLE.hover;

    this.hovered = on;
    this.hoverTween?.kill();
    this.hoverTween = gsap.timeline();

    if (on) {
      this.hoverTween
        .to(this, { shine: 1, duration: fade, ease: "power2.out" }, 0)
        .to(this, { wobble, duration: period / 2, ease: "sine.out" }, 0)
        .to(this, {
          wobble: -wobble,
          duration: period,
          ease,
          yoyo: true,
          repeat: -1,
        });
    } else {
      this.hoverTween.to(this, {
        shine: 0,
        wobble: 0,
        duration: fade,
        ease: "power2.out",
      });
    }
  }

  spinCrazy() {
    const { minTurns, maxTurns, duration, ease, overshoot, settle } =
      HANDLE.spin;
    const turns = gsap.utils.random(minTurns, maxTurns, 1);
    const sign = Math.random() < 0.5 ? 1 : -1;
    const stepsPerTurn = 360 / HANDLE.stepAngle;
    const previous = this.tween;
    let last = this.degrees;

    this.setHover(false);
    this.steps += sign * turns * stepsPerTurn;

    const target = this.targetAngle;
    const timeline = gsap.timeline({
      onUpdate: () => {
        const speed = Math.abs(this.degrees - last) / gsap.ticker.deltaRatio();

        last = this.degrees;
        this.updateBlur(speed);
      },
      onComplete: () => this.endBlur(),
    });

    timeline
      .call(() => {
        previous?.kill();
        this.follow?.tween.kill();
        this.follow = undefined;
        last = this.degrees;
        this.startBlur();
      })
      .to(this.scale, { x: 1, y: 1, duration: 0.2 }, 0)
      .to(this, { lift: 0, duration: 0.2 }, 0)
      .addLabel("spin")
      .to(this, { angle: target + sign * overshoot, duration, ease }, "spin")
      .addLabel("settle")
      .call(() => this.whoosh?.stop(), [], "settle")
      .to(this, { angle: target, ...settle }, "settle");

    this.tween = timeline;

    return timeline;
  }

  release() {
    const { angle, duration, ease, scale, lift } = HANDLE.release;
    const timeline = gsap.timeline();

    return timeline
      .call(() => this.takeOver(timeline))
      .to(this, { angle: () => this.targetAngle + angle, duration, ease })
      .to(this.scale, { x: scale, y: scale, duration, ease }, 0)
      .to(this, { lift, duration, ease }, 0);
  }

  returnHome() {
    const { steps, duration, ease } = HANDLE.home;
    const timeline = gsap.timeline();

    return timeline
      .call(() => {
        this.takeOver(timeline);
        this.steps += steps;
      })
      .to(this, { angle: () => this.targetAngle, duration, ease })
      .to(this.scale, { x: 1, y: 1, duration, ease: "power2.out" }, 0)
      .to(this, { lift: 0, duration, ease: "power2.out" }, 0);
  }

  normalize() {
    const stepsPerTurn = 360 / HANDLE.stepAngle;

    this.stop();
    this.hoverTween?.kill();
    this.punch?.kill();
    this.hovered = false;
    this.endBlur();
    this.scale.set(1);
    this.lift = 0;
    this.wobbleDegrees = 0;
    this.shine = 0;
    this.steps = ((this.steps % stepsPerTurn) + stepsPerTurn) % stepsPerTurn;
    this.angle = this.targetAngle;
  }

  private applyAngle() {
    const angle = this.degrees + this.wobbleDegrees;

    this.wheel.angle = angle;
    this.shadow.angle = angle;
  }

  private takeOver(timeline: gsap.core.Timeline) {
    this.stop();
    this.setHover(false);
    this.tween = timeline;
  }

  private stop() {
    this.tween?.kill();
    this.follow?.tween.kill();
    this.follow = undefined;
    this.whoosh?.stop();
    this.whoosh = undefined;
  }

  private createBlur() {
    const { kernelSize, padding } = HANDLE.blur;

    const blur = new RadialBlurFilter({ kernelSize, radius: -1 });

    blur.padding = padding;
    blur.resolution = "inherit";

    return blur;
  }

  private startBlur() {
    this.blurring = true;
    this.blurs.forEach((blur) => (blur.angle = 0));
    this.syncFilters();
    this.whoosh = audio.whoosh();
  }

  private updateBlur(speed: number) {
    const { perDegree, max } = HANDLE.blur;
    const amount = Math.min(speed * perDegree, max);

    this.whoosh?.setSpeed(amount / max);
    [this.wheel, this.shadow].forEach((sprite, i) => {
      const blur = this.blurs[i];
      const bounds = sprite.getBounds();
      const hub = sprite.getGlobalPosition();

      blur.angle = amount;
      blur.centerX = hub.x - Math.max(bounds.minX, 0) + blur.padding;
      blur.centerY = hub.y - Math.max(bounds.minY, 0) + blur.padding;
    });
  }

  private endBlur() {
    this.whoosh?.stop();
    this.whoosh = undefined;
    this.blurring = false;
    this.syncFilters();
  }

  private syncFilters() {
    const wheel: Filter[] = [];

    if (this.shineAmount > 0) wheel.push(this.brightness);
    if (this.blurring) wheel.push(this.blurs[0]);

    this.wheel.filters = wheel.length ? wheel : null;
    this.shadow.filters = this.blurring ? [this.blurs[1]] : null;
  }
}
