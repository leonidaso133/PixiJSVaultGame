import gsap from "gsap";
import { Container, Graphics, Sprite } from "pixi.js";
import { AMBIENCE, DESIGN } from "../config";
import TextureFactory from "./TextureFactory";

export default class FloorShimmer extends Container {
  label = "FloorShimmer";

  private bands: Sprite[] = [];
  private loops: gsap.core.Tween[] = [];

  constructor() {
    super();

    const { poly, bands, tint, angle } = AMBIENCE.floor;
    const clip = new Graphics().poly([...poly]).fill(0xffffff);

    this.eventMode = "none";

    bands.forEach(({ y, width, height, alpha }) => {
      const band = new Sprite(TextureFactory.warmBand());

      band.anchor.set(0.5);
      band.setSize(width, height);
      band.position.set(-width, y);
      band.angle = angle;
      band.tint = tint;
      band.alpha = alpha;
      band.blendMode = "add";
      this.bands.push(band);
      this.addChild(band);
    });

    this.addChild(clip);
    this.mask = clip;
    this.visible = false;
  }

  start() {
    const { bands, ease } = AMBIENCE.floor;

    this.visible = true;
    this.loops.forEach((loop) => loop.kill());
    this.loops = this.bands.map((band, i) =>
      gsap.fromTo(
        band,
        { x: -band.width / 2 },
        {
          x: DESIGN.width + band.width / 2,
          duration: bands[i].duration,
          ease,
          repeat: -1,
          yoyo: true,
          delay: i * 2,
        },
      ),
    );
  }

  pause() {
    this.loops.forEach((loop) => loop.pause());
  }

  resume() {
    this.loops.forEach((loop) => loop.resume());
  }
}
