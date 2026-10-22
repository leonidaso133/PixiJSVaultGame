import gsap from "gsap";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { AdvancedBloomFilter } from "pixi-filters";
import { GLITTER, TREASURE } from "../config";
import Glitter from "../fx/Glitter";
import TextureFactory from "../fx/TextureFactory";

export default class TreasureLayer extends Container {
  label = "TreasureLayer";

  readonly glitter: Glitter;

  private bloomed = new Container({ label: "TreasureBloom" });
  private sweep: Sprite;
  private bloom: AdvancedBloomFilter;
  private timeline?: gsap.core.Timeline;
  private sweepLoop?: gsap.core.Timeline;

  constructor() {
    super();

    const { center, radius, bloom } = TREASURE;
    const shine = new Container({ label: "TreasureSweep" });
    const copy = new Sprite(TreasureLayer.createCopy());
    const clip = new Graphics()
      .circle(center.x, center.y, radius)
      .fill(0xffffff);

    this.sweep = new Sprite(TextureFactory.warmBand());
    this.sweep.anchor.set(0.5);
    this.sweep.setSize(GLITTER.sweep.width, GLITTER.sweep.height);
    this.sweep.angle = GLITTER.sweep.angle;
    this.sweep.position.set(center.x, center.y);
    this.sweep.blendMode = "add";
    this.sweep.alpha = 0;

    copy.position.set(center.x - radius, center.y - radius);
    shine.addChild(this.sweep, clip);
    shine.mask = clip;

    this.glitter = new Glitter();
    this.bloomed.addChild(copy, this.glitter);

    this.bloom = new AdvancedBloomFilter({
      threshold: bloom.threshold,
      blur: bloom.blur,
      quality: bloom.quality,
      bloomScale: 0,
    });
    this.bloom.padding = bloom.padding;

    this.addChild(this.bloomed, shine);
    this.visible = false;
  }

  reveal() {
    const { peak, rest, in: rise, out } = TREASURE.bloom;

    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .call(() => {
        this.visible = true;
        this.bloom.bloomScale = 0;
        this.bloomed.filters = [this.bloom];
      })
      .to(this.bloom, { bloomScale: peak, duration: rise, ease: "power2.out" })
      .to(this.bloom, { bloomScale: rest, duration: out, ease: "sine.inOut" });

    return this.timeline;
  }

  shine() {
    const { sweep } = GLITTER;
    const { x } = TREASURE.center;

    this.glitter.start();
    this.sweepLoop?.kill();
    this.sweepLoop = gsap
      .timeline({ repeat: -1, repeatDelay: sweep.period - sweep.duration })
      .fromTo(
        this.sweep,
        { x: x - sweep.travel },
        { x: x + sweep.travel, duration: sweep.duration, ease: sweep.ease },
        0,
      )
      .fromTo(
        this.sweep,
        { alpha: 0 },
        {
          alpha: sweep.alpha,
          duration: sweep.duration / 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        },
        0,
      );
  }

  conceal() {
    this.timeline?.kill();
    this.timeline = gsap
      .timeline()
      .add(this.glitter.stop(), 0)
      .to(
        this.bloom,
        {
          bloomScale: 0,
          duration: TREASURE.bloom.dim,
          ease: "power2.in",
        },
        0,
      )
      .call(() => this.hide());

    return this.timeline;
  }

  private hide() {
    this.sweepLoop?.kill();
    this.sweepLoop = undefined;
    this.sweep.alpha = 0;
    this.bloomed.filters = null;
    this.visible = false;
  }

  private static createCopy() {
    const { center, radius } = TREASURE;
    const size = radius * 2;
    const source = Texture.from("background").source
      .resource as CanvasImageSource;

    return TextureFactory.canvas("treasureCopy", size, size, (ctx) => {
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        source,
        center.x - radius,
        center.y - radius,
        size,
        size,
        0,
        0,
        size,
        size,
      );
    });
  }
}
