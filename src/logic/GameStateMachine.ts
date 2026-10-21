import { EventEmitter } from "pixi.js";
import { GAME, INPUT } from "../config";
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

  constructor(
    private vault: VaultScene,
    private input: HandleInput,
    private timer: Timer,
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
    this.vault.keypad.setTime(0);
    this.queue.length = 0;
    this.outcome = new Deferred<Outcome>();
    this.setState("Idle");
    this.input.enable();

    return this.outcome.promise;
  }

  private async win() {
    const door = this.vault.door;

    this.setState("Unlocking");
    await door.swingOpen();
    this.setState("Open");
    await delay(GAME.winHold);
    this.setState("Closing");
    await door.swingClosed();
  }

  private async fail() {
    this.setState("Failing");
    await this.vault.door.handle.spinCrazy();
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

    this.busy = true;

    while (dir) {
      const tween = this.vault.door.handle.rotateStep(dir);
      const step = this.apply(dir);

      await tween;
      if (this.finish(step)) break;
      dir = this.queue.shift();
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
      if (step.result === "unlock") this.timer.stop();
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
