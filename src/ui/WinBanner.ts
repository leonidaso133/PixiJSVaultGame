import gsap from "gsap";
import {
  CanvasTextMetrics,
  Container,
  FillGradient,
  Sprite,
  Text,
  TextStyle,
} from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { BANNER, TREASURE } from "../config";
import Timer from "../logic/Timer";
import TextureFactory from "../fx/TextureFactory";

export default class WinBanner extends Container {
  label = "WinBanner";

  private ribbon: Sprite;
  private title = new Container({ label: "BannerTitle" });
  private letters: Text[] = [];
  private time: Text;
  private glow: GlowFilter;
  private ribbonScale: number;
  private timeline?: gsap.core.Timeline;

  constructor() {
    super();

    const { time, glow, resolution } = BANNER;

    this.eventMode = "none";
    this.position.set(TREASURE.center.x, BANNER.y);

    this.ribbon = new Sprite(WinBanner.createRibbon());
    this.ribbon.anchor.set(0.5);
    this.ribbonScale = this.ribbon.scale.x;

    this.createLetters();

    this.time = new Text({
      text: Timer.format(0),
      resolution,
      style: {
        fontFamily: time.fontFamily,
        fontSize: time.fontSize,
        fill: time.fill,
        dropShadow: { color: time.glow, blur: 8, distance: 0, alpha: 0.9 },
      },
    });
    this.time.anchor.set(0.5);
    this.time.y = time.y;

    this.glow = new GlowFilter({
      distance: glow.distance,
      outerStrength: 0,
      color: glow.color,
      quality: glow.quality,
    });
    this.glow.resolution = "inherit";

    this.addChild(this.ribbon, this.title, this.time);
    this.visible = false;
  }

  show(seconds: number) {
    const { ribbon, letters, glow, time, show } = BANNER;
    const clock = { value: 0 };

    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .call(() => {
        this.visible = true;
        this.alpha = 1;
        this.y = BANNER.y;
        this.title.filters = null;
        this.time.text = Timer.format(0);
      })
      .fromTo(this.ribbon, { alpha: 0 }, { alpha: ribbon.alpha, ...show }, 0)
      .fromTo(
        this.ribbon.scale,
        { x: this.ribbonScale * 0.6 },
        { x: this.ribbonScale, ...show },
        0,
      )
      .fromTo(
        this.letters,
        { alpha: 0, y: BANNER.titleY + letters.rise },
        {
          alpha: 1,
          y: BANNER.titleY,
          duration: letters.duration,
          ease: letters.ease,
          stagger: letters.stagger,
          modifiers: { alpha: (alpha: number) => Math.min(alpha, 1) },
        },
        0.1,
      )
      .fromTo(
        this.letters.map((letter) => letter.scale),
        { x: 0, y: 0 },
        {
          x: 1,
          y: 1,
          duration: letters.duration,
          ease: letters.ease,
          stagger: letters.stagger,
        },
        0.1,
      )
      .call(() => (this.title.filters = [this.glow]), [], glow.delay)
      .fromTo(
        this.glow,
        { outerStrength: 0 },
        { outerStrength: glow.strength, duration: 0.6, ease: "power2.out" },
        glow.delay,
      )
      .fromTo(this.time, { alpha: 0 }, { alpha: 1, duration: 0.2 }, time.delay)
      .to(
        clock,
        {
          value: seconds,
          duration: time.count,
          ease: "power2.out",
          onUpdate: () => (this.time.text = Timer.format(clock.value)),
        },
        time.delay,
      );

    return this.timeline;
  }

  hide() {
    const { duration, ease, drop } = BANNER.hide;

    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .to(this, { alpha: 0, y: BANNER.y + drop, duration, ease })
      .call(() => {
        this.visible = false;
        this.title.filters = null;
        this.y = BANNER.y;
      });

    return this.timeline;
  }

  private createLetters() {
    const { title, font, colors, stroke, shadow, letterSpacing, resolution } =
      BANNER;
    const fill = new FillGradient({
      type: "linear",
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: colors.map((color, i) => ({
        offset: i / (colors.length - 1),
        color,
      })),
      textureSpace: "local",
    });
    const style = new TextStyle({ ...font, fill, stroke, dropShadow: shadow });
    const widths = [...title].map(
      (char) =>
        CanvasTextMetrics.measureText(char, style).width + letterSpacing,
    );
    const total = widths.reduce((sum, width) => sum + width, 0) - letterSpacing;
    let x = -total / 2;

    [...title].forEach((char, i) => {
      const letter = new Text({ text: char, style, resolution });

      letter.anchor.set(0.5);
      letter.position.set(x + (widths[i] - letterSpacing) / 2, BANNER.titleY);
      x += widths[i];
      this.letters.push(letter);
      this.title.addChild(letter);
    });
  }

  private static createRibbon() {
    const { width, height, fade, color, line } = BANNER.ribbon;

    return TextureFactory.canvas("bannerRibbon", width, height, (ctx) => {
      const across = (rgb: string, alpha: number) => {
        const gradient = ctx.createLinearGradient(0, 0, width, 0);

        gradient.addColorStop(0, `rgba(${rgb},0)`);
        gradient.addColorStop(fade, `rgba(${rgb},${alpha})`);
        gradient.addColorStop(1 - fade, `rgba(${rgb},${alpha})`);
        gradient.addColorStop(1, `rgba(${rgb},0)`);

        return gradient;
      };

      ctx.fillStyle = across(color, 1);
      ctx.fillRect(0, line.inset, width, height - line.inset * 2);
      ctx.fillStyle = across(line.color, 1);
      ctx.fillRect(0, line.inset, width, line.width);
      ctx.fillRect(0, height - line.inset - line.width, width, line.width);
    });
  }
}
