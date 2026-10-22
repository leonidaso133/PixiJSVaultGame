import gsap from "gsap";
import { Container, Graphics } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { AMBIENCE, ARROWS, DOOR } from "../config";
import { Direction } from "../logic/Combination";
import { reducedMotion } from "../utils/motion";

interface Arrow {
  root: Container;
  glow: GlowFilter;
  fade?: gsap.core.Timeline;
  nudge?: gsap.core.Tween;
}

export default class DirectionArrows extends Container {
  label = "DirectionArrows";

  private arrows: Record<Direction, Arrow>;
  private shown: Direction | null = null;
  private hint = false;

  constructor() {
    super();

    this.position.set(DOOR.position.x, DOOR.position.y);
    this.eventMode = "none";
    this.arrows = {
      CCW: this.createArrow(180 + ARROWS.lift, -1),
      CW: this.createArrow(-ARROWS.lift, 1),
    };
  }

  show(dir: Direction | null) {
    if (dir === this.shown) return;

    this.shown = dir;
    this.refresh();
  }

  setHint(on: boolean) {
    if (on === this.hint) return;

    this.hint = on;
    this.refresh();
  }

  nudge(dir: Direction) {
    const { angle, duration, ease } = ARROWS.nudge;
    const arrow = this.arrows[dir];

    arrow.nudge?.kill();
    arrow.nudge = gsap.fromTo(
      arrow.root,
      { angle: 0 },
      {
        angle: (dir === "CW" ? 1 : -1) * angle,
        duration: duration / 2,
        ease,
        yoyo: true,
        repeat: 1,
      },
    );
  }

  tease() {
    if (this.shown) return gsap.timeline();

    const { alpha, hold, angle, ease } = AMBIENCE.nudge.arrows;
    const { fade } = ARROWS;
    const timeline = gsap.timeline({
      onComplete: () => this.refresh(),
      onInterrupt: () =>
        Object.values(this.arrows).forEach((arrow) => (arrow.root.angle = 0)),
    });

    (Object.keys(this.arrows) as Direction[]).forEach((dir) => {
      const arrow = this.arrows[dir];
      const sign = dir === "CW" ? 1 : -1;

      arrow.fade?.kill();
      arrow.nudge?.kill();
      arrow.root.filters = [arrow.glow];
      arrow.fade = timeline;
      timeline.to(arrow.root, { alpha, ...fade }, 0).fromTo(
        arrow.root,
        { angle: 0 },
        {
          keyframes: [
            {
              angle: sign * angle,
              duration: fade.duration,
              ease: "power2.out",
            },
            {
              angle: 0,
              duration: hold * 2,
              ease: reducedMotion() ? "sine.inOut" : ease,
            },
          ],
        },
        0,
      );
    });

    return timeline;
  }

  private refresh() {
    (Object.keys(this.arrows) as Direction[]).forEach((dir) => {
      const arrow = this.arrows[dir];
      const { fade, pulse } = ARROWS;
      const rest = this.hint ? ARROWS.touchAlpha : 0;

      arrow.fade?.kill();
      arrow.fade = gsap.timeline();

      if (dir === this.shown) {
        arrow.root.filters = [arrow.glow];
        arrow.fade.to(arrow.root, { alpha: 1, ...fade }).to(arrow.root, {
          alpha: pulse.min,
          duration: pulse.duration,
          ease: pulse.ease,
          yoyo: true,
          repeat: -1,
        });
      } else {
        arrow.fade.to(arrow.root, {
          alpha: rest,
          ...fade,
          onComplete: () => {
            if (rest === 0) arrow.root.filters = null;
          },
        });
      }
    });
  }

  private createArrow(center: number, sign: 1 | -1): Arrow {
    const { radius, span, thickness, head, color } = ARROWS;
    const rad = Math.PI / 180;
    const start = (center - (sign * span) / 2) * rad;
    const end = (center + (sign * span) / 2) * rad;
    const tangent = { x: -Math.sin(end) * sign, y: Math.cos(end) * sign };
    const normal = { x: Math.cos(end), y: Math.sin(end) };
    const base = { x: normal.x * radius, y: normal.y * radius };
    const wing = head * 0.6;

    const shape = new Graphics()
      .arc(0, 0, radius, start, end, sign < 0)
      .stroke({ width: thickness, color, cap: "round" })
      .poly([
        base.x + normal.x * wing,
        base.y + normal.y * wing,
        base.x + tangent.x * head,
        base.y + tangent.y * head,
        base.x - normal.x * wing,
        base.y - normal.y * wing,
      ])
      .fill(color);

    const root = new Container({ alpha: 0 });
    const glow = new GlowFilter({
      color: ARROWS.glow.color,
      distance: ARROWS.glow.distance,
      outerStrength: ARROWS.glow.strength,
      quality: ARROWS.glow.quality,
    });

    glow.resolution = "inherit";
    root.addChild(shape);
    this.addChild(root);

    return { root, glow };
  }
}
