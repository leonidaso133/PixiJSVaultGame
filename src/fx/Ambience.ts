import gsap from "gsap";
import { AMBIENCE } from "../config";
import VaultScene from "../scenes/VaultScene";
import DustMotes from "./DustMotes";
import FloorShimmer from "./FloorShimmer";
import LcdAmbience from "./LcdAmbience";
import Sheen from "./Sheen";
import WallLamps from "./WallLamps";

const random = gsap.utils.random;

interface Every {
  min: number;
  max: number;
}

export default class Ambience {
  readonly lamps = new WallLamps();

  private dust = new DustMotes();
  private floor = new FloorShimmer();
  private lcd: LcdAmbience;
  private sheens: Sheen[];
  private sweeps: gsap.core.Tween[] = [];
  private nudge?: gsap.core.Tween;
  private running = false;
  private paused = false;

  constructor(private vault: VaultScene) {
    const { door, keypad, backgroundLayer, ambienceLayer } = vault;

    this.lcd = new LcdAmbience(keypad);
    this.sheens = [door.handle.sheen, door.glint];

    backgroundLayer.addChild(this.floor);
    ambienceLayer.addChild(this.lcd.keys, this.lamps, this.dust);
  }

  start() {
    const { handle, door } = AMBIENCE.sheen;

    this.running = true;
    this.paused = false;
    this.lamps.start();
    this.dust.start();
    this.floor.start();
    this.lcd.start();
    this.sweeps.forEach((sweep) => sweep.kill());
    this.schedule(0, handle.every);
    this.schedule(1, door.every);
  }

  pause() {
    if (!this.running || this.paused) return;

    this.paused = true;
    this.disarm();
    this.lamps.pause();
    this.dust.pause();
    this.floor.pause();
    this.lcd.pause();
    this.sweeps.forEach((sweep) => sweep.pause());
    this.sheens.forEach((sheen) => sheen.stop(AMBIENCE.sheen.fade));
  }

  resume() {
    if (!this.running || !this.paused) return;

    this.paused = false;
    this.lamps.resume();
    this.dust.resume();
    this.floor.resume();
    this.lcd.resume();
    this.sweeps.forEach((sweep) => sweep.resume());
  }

  arm() {
    this.disarm();
    this.nudge = gsap.delayedCall(AMBIENCE.nudge.after, () => {
      this.vault.arrows.tease();
      this.vault.door.handle.tease();
      this.arm();
    });
  }

  disarm() {
    this.nudge?.kill();
    this.nudge = undefined;
  }

  private schedule(index: number, every: Every) {
    this.sweeps[index] = gsap.delayedCall(random(every.min, every.max), () => {
      this.sheens[index].sweep();
      this.schedule(index, every);
    });
  }
}
