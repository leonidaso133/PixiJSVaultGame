import gsap from "gsap";
import { Container, Graphics } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { audio } from "../audio/AudioManager";
import { LEDS } from "../config";
import { LockStep } from "../logic/CombinationLock";

export type LedState = "off" | "active" | "ready" | "done" | "error";

interface Led {
  root: Container;
  body: Graphics;
  glow: GlowFilter;
  state: LedState;
  tween?: gsap.core.Tween | gsap.core.Timeline;
}

export default class ProgressLeds extends Container {
  label = "ProgressLeds";

  private leds: Led[] = [];

  constructor(width: number) {
    super();

    const { count, spacing, radius, rim } = LEDS;
    const startX = width / 2 - ((count - 1) * spacing) / 2;

    for (let i = 0; i < count; i++) {
      const root = new Container({ x: startX + i * spacing, y: LEDS.y });
      const socket = new Graphics()
        .circle(0, 0, radius + rim.width)
        .fill({ color: rim.color, alpha: rim.alpha });
      const body = new Graphics().circle(0, 0, radius).fill(0xffffff);
      const highlight = new Graphics()
        .circle(-radius * 0.3, -radius * 0.35, radius * 0.35)
        .fill({ color: 0xffffff, alpha: 0.45 });
      const glow = new GlowFilter({
        distance: LEDS.glow.distance,
        outerStrength: 0,
        quality: LEDS.glow.quality,
      });

      glow.resolution = "inherit";

      body.tint = LEDS.colors.off;
      root.addChild(socket, body, highlight);
      this.addChild(root);
      this.leds.push({ root, body, glow, state: "off" });
    }
  }

  onLock(step: LockStep) {
    const progress = step.count === step.target ? "ready" : "active";

    if (step.result === "pairComplete") {
      this.set(step.pairIndex - 1, "done");
      this.set(step.pairIndex, progress);
    } else if (step.result === "step") {
      this.set(step.pairIndex, progress);
    }
  }

  allDone() {
    const { stagger, gap, flash } = LEDS.chase;
    const timeline = gsap.timeline();

    this.leds.forEach((led, i) => {
      timeline.call(
        () => {
          led.state = "done";
          led.tween?.kill();
          led.body.alpha = 1;
          this.lightUp(led, i);
        },
        [],
        i * stagger,
      );
    });

    return timeline.fromTo(
      this.leds.map((led) => led.body),
      { alpha: 1 },
      {
        alpha: 0.25,
        duration: flash.duration,
        ease: "steps(1)",
        yoyo: true,
        repeat: flash.times * 2 - 1,
        immediateRender: false,
      },
      this.leds.length * stagger + gap,
    );
  }

  flashError() {
    const { times, duration } = LEDS.flash;
    const timeline = gsap.timeline();

    this.leds.forEach((led, i) => {
      this.set(i, "error");
      led.tween = gsap.fromTo(
        led.body,
        { alpha: 1 },
        {
          alpha: 0.15,
          duration,
          ease: "steps(1)",
          repeat: times * 2 - 1,
          yoyo: true,
        },
      );
      timeline.add(led.tween, 0);
    });

    return timeline;
  }

  reset() {
    const { duration, stagger } = LEDS.reset;
    const timeline = gsap.timeline();

    this.leds.forEach((led, i) => {
      if (led.state === "off") return;

      const at = i * stagger;

      timeline
        .call(() => led.tween?.kill(), [], at)
        .to(led.body, { alpha: 0, duration, ease: "power2.in" }, at)
        .call(() => this.set(i, "off"), [], at + duration);
    });

    return timeline;
  }

  clear() {
    this.leds.forEach((_, i) => this.set(i, "off"));
  }

  private set(index: number, state: LedState) {
    const led = this.leds[index];

    if (!led || led.state === state) return;

    led.state = state;
    led.tween?.kill();
    led.tween = undefined;
    led.body.alpha = 1;
    led.root.scale.set(1);
    led.glow.outerStrength = 0;
    led.root.filters = null;

    if (state === "off") led.body.tint = LEDS.colors.off;
    else if (state === "error") led.body.tint = LEDS.colors.error;
    else if (state === "active") this.pulse(led);
    else if (state === "ready") led.body.tint = LEDS.colors.active;
    else this.lightUp(led, index);
  }

  private pulse(led: Led) {
    const { min, duration, ease } = LEDS.pulse;

    led.body.tint = LEDS.colors.active;
    led.tween = gsap.to(led.body, {
      alpha: min,
      duration,
      ease,
      yoyo: true,
      repeat: -1,
    });
  }

  private lightUp(led: Led, index: number) {
    const { pop, glow } = LEDS;

    led.body.tint = LEDS.colors.done;
    led.glow.color = LEDS.colors.done;
    led.root.filters = [led.glow];
    led.tween = gsap
      .timeline()
      .to(led.root.scale, {
        x: pop.scale,
        y: pop.scale,
        duration: pop.duration / 2,
        ease: "power2.out",
      })
      .to(led.root.scale, {
        x: 1,
        y: 1,
        duration: pop.duration,
        ease: pop.ease,
      })
      .to(led.glow, { outerStrength: glow.peak, duration: pop.duration / 2 }, 0)
      .to(led.glow, { outerStrength: glow.rest, duration: pop.duration });

    audio.ledOn(index);
  }
}
