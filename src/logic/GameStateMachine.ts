import gsap from "gsap";
import { EventEmitter } from "pixi.js";
import { audio } from "../audio/AudioManager";
import {
  CLOSE,
  FAIL,
  FX,
  GAME,
  HANDLE,
  INPUT,
  KEYPAD,
  PUSH,
  TREASURE,
  WIN,
} from "../config";
import ScreenFx from "../fx/ScreenFx";
import HandleInput, { StepSource } from "../input/HandleInput";
import VaultScene from "../scenes/VaultScene";
import { delay } from "../utils/async";
import { Debug } from "../utils/debug";
import Deferred from "../utils/Deferred";
import Combination, { Direction } from "./Combination";
import CombinationLock, { LockStep } from "./CombinationLock";
import Timer from "./Timer";

export type GameState =
  "Idle" | "Input" | "Unlocking" | "Open" | "Closing" | "Failing";

type Outcome = "unlock" | "fail";

export default class GameStateMachine extends EventEmitter<{
  state: [GameState];
  lock: [LockStep];
}> {
  readonly lock = new CombinationLock(new Combination([]));

  private current: GameState = "Idle";
  private queue: Direction[] = [];
  private busy = false;
  private outcome?: Deferred<Outcome>;
  private sequence?: gsap.core.Timeline;

  constructor(
    private vault: VaultScene,
    private input: HandleInput,
    private timer: Timer,
    private fx: ScreenFx,
  ) {
    super();

    input.on("step", this.onStep, this);
    input.canDrag = () => !this.busy && this.queue.length === 0;
  }

  get state() {
    return this.current;
  }

  async run() {
    for (;;) {
      const outcome = await this.play();

      if (outcome === "unlock") await this.win();
      else await this.fail();
    }
  }

  private play() {
    const code = Combination.random();

    console.log("🔐 Secret combination:", code.toString());

    this.lock.reset(code);
    this.vault.door.handle.normalize();
    this.timer.reset();
    this.vault.keypad.reset(KEYPAD.text.initial);
    this.vault.keypad.leds.clear();
    this.queue.length = 0;
    this.outcome = new Deferred<Outcome>();
    this.setState("Idle");
    this.input.enable();

    return this.outcome.promise;
  }

  private async win() {
    const { door, keypad, camera, treasure, light, particles, banner } =
      this.vault;
    const { x, y } = TREASURE.center;
    const seconds = this.timer.elapsed;
    const opened = new Deferred<void>();

    this.setState("Unlocking");
    this.sequence?.kill();
    this.sequence = gsap
      .timeline()
      .addLabel("unlock", WIN.unlock)
      .add(keypad.leds.allDone(), "unlock")
      .add(keypad.celebrate(), "unlock")
      .addLabel("release", WIN.release)
      .add(door.handle.release(), "release")
      .addLabel("clunk", WIN.clunk)
      .call(() => audio.play("clunk"), [], "clunk")
      .add(this.fx.shake(camera, FX.unlockShake), "clunk")
      .add(door.jolt(), "clunk")
      .addLabel("swing", WIN.swing)
      .add(door.swingOpen(), "swing")
      .addLabel("burst", WIN.burst)
      .add(treasure.reveal(), "burst")
      .add(light.burst(), "burst")
      .add(this.fx.flash(), "burst")
      .add(this.vault.pushTo(1, PUSH.in), "burst")
      .addLabel("reveal", WIN.reveal)
      .call(
        () => {
          audio.play("chime");
          treasure.shine();
        },
        [],
        "reveal",
      )
      .add(particles.burst(x, y), "reveal")
      .add(banner.show(seconds), "reveal")
      .addLabel("open", WIN.open)
      .call(() => opened.resolve(), [], "open");

    await opened.promise;
    this.setState("Open");
    await delay(GAME.winHold);
    await this.close();
  }

  private async close() {
    const { door, keypad, camera, treasure, light, particles, banner } =
      this.vault;
    const { x, y } = TREASURE.center;

    this.setState("Closing");
    this.sequence?.kill();
    this.sequence = gsap
      .timeline()
      .add(banner.hide(), 0)
      .add(treasure.conceal(), 0)
      .add(light.dim(), 0)
      .add(this.vault.pushTo(0, PUSH.out), 0)
      .add(door.swingClosed(), CLOSE.swing)
      .addLabel("slam", ">")
      .call(() => audio.play("clunk"), [], "slam")
      .add(this.fx.shake(camera, FX.slamShake), "slam")
      .add(particles.dust(x, y), "slam")
      .add(door.handle.returnHome(), "slam")
      .addLabel("reset", `slam+=${CLOSE.reset}`)
      .call(() => this.timer.reset(), [], "reset")
      .add(keypad.leds.reset(), "reset")
      .add(keypad.rollTo(KEYPAD.text.initial), "reset");

    await this.sequence;
  }

  private async fail() {
    const { door, keypad, camera } = this.vault;

    this.setState("Failing");
    audio.play("error");
    keypad.showError();

    await gsap
      .timeline()
      .addLabel("hit")
      .add(keypad.leds.flashError(), "hit")
      .add(this.fx.vignette(), "hit")
      .add(this.fx.shake(camera), "hit")
      .addLabel("spin", HANDLE.spin.delay)
      .add(door.handle.spinCrazy(), "spin")
      .addLabel("reset", FAIL.resetAt)
      .call(() => this.timer.reset(), [], "reset")
      .add(keypad.rollTo(KEYPAD.text.initial), "reset")
      .add(keypad.leds.reset(), "reset");
  }

  private onStep(dir: Direction, source: StepSource) {
    if (!this.outcome) return;

    if (source === "drag") {
      this.vault.door.handle.commitStep(dir);
      this.finish(this.apply(dir));
      return;
    }

    if (!this.busy) {
      void this.consume(dir);
    } else if (this.queue.length < INPUT.bufferSize) {
      this.queue.push(dir);
    }
  }

  private async consume(first: Direction) {
    let dir: Direction | undefined = first;
    let chained = false;

    this.busy = true;

    while (dir) {
      const tween = this.vault.door.handle.rotateStep(dir, chained);
      const step = this.apply(dir);

      await tween;
      if (this.finish(step)) break;
      dir = this.queue.shift();
      chained = true;
    }

    this.busy = false;
  }

  private apply(dir: Direction) {
    if (this.current === "Idle") {
      this.timer.start();
      this.setState("Input");
    }

    const step = this.lock.input(dir);

    Debug.log("lock", dir, step);
    this.emit("lock", step);

    if (step.result === "unlock" || step.result === "fail") {
      this.timer.stop();
      this.input.disable();
      this.queue.length = 0;
    }

    return step;
  }

  private finish(step: LockStep) {
    if (step.result !== "unlock" && step.result !== "fail") return false;

    const outcome = this.outcome;

    this.outcome = undefined;
    outcome?.resolve(step.result);

    return true;
  }

  private setState(state: GameState) {
    this.current = state;
    Debug.log("state", state);
    this.emit("state", state);
  }
}
