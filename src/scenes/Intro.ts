import gsap from "gsap";
import { Container } from "pixi.js";
import { INTRO } from "../config";
import WallLamps from "../fx/WallLamps";
import VaultScene from "./VaultScene";

export default class Intro {
  private timeline?: gsap.core.Timeline;

  constructor(
    private vault: VaultScene,
    private lamps: WallLamps,
    private surroundings: Container[],
  ) {}

  setup() {
    const { blackout, keypad } = this.vault;

    this.lamps.darken();
    keypad.blank();
    blackout.visible = true;
    blackout.alpha = 1;
    this.surroundings.forEach((item) => (item.alpha = 0));
  }

  async play() {
    const { vault, lamps, surroundings } = this;
    const { blackout, keypad, door, arrows } = vault;
    const { fade, dim } = INTRO;
    const flicker = lamps.flickOn();

    this.timeline = gsap
      .timeline()
      .add(flicker, INTRO.lamps)
      .to(
        blackout,
        {
          alpha: dim.alpha,
          duration: flicker.duration(),
          ease: `steps(${dim.steps})`,
        },
        INTRO.lamps,
      )
      .addLabel("room", INTRO.room)
      .add(lamps.settle(fade.duration), "room")
      .to(blackout, { alpha: 0, ...fade }, "room")
      .to(surroundings, { alpha: 1, ...fade }, "room")
      .set(blackout, { visible: false })
      .add(door.handle.introSpin(), INTRO.handle)
      .add(keypad.boot(), INTRO.lcd)
      .add(() => void arrows.tease(), INTRO.hint);

    window.addEventListener("pointerdown", this.skip, true);
    window.addEventListener("keydown", this.skip, true);

    await this.timeline;

    window.removeEventListener("pointerdown", this.skip, true);
    window.removeEventListener("keydown", this.skip, true);
  }

  private skip = (event: Event) => {
    event.stopImmediatePropagation();
    this.timeline?.progress(1);
  };
}
