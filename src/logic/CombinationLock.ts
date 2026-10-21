import Combination, { Direction } from "./Combination";

export type LockResult = "step" | "pairComplete" | "unlock" | "fail";

export type FailReason = "wrongDir" | "overshoot" | "earlySwitch";

export interface LockStep {
  result: LockResult;
  pairIndex: number;
  count: number;
  target: number;
  reason?: FailReason;
}

export default class CombinationLock {
  private code: Combination;
  private pairIndex = 0;
  private count = 0;
  private currentDir: Direction | null = null;

  constructor(code: Combination) {
    this.code = code;
  }

  get combination() {
    return this.code;
  }

  reset(code: Combination) {
    this.code = code;
    this.pairIndex = 0;
    this.count = 0;
    this.currentDir = null;
  }

  input(dir: Direction): LockStep {
    if (this.currentDir === null) {
      if (dir !== this.target.dir) return this.fail("wrongDir");
      return this.advance(dir, "step");
    }

    if (dir === this.currentDir) return this.advance(dir, "step");

    if (this.count < this.target.value) return this.fail("earlySwitch");

    this.pairIndex++;
    this.count = 0;
    return this.advance(dir, "pairComplete");
  }

  private get target() {
    return this.code.pairs[this.pairIndex];
  }

  private get isLastPair() {
    return this.pairIndex === this.code.pairs.length - 1;
  }

  private advance(dir: Direction, result: LockResult) {
    this.currentDir = dir;
    this.count++;

    if (this.count > this.target.value) return this.fail("overshoot");
    if (this.count === this.target.value && this.isLastPair) {
      return this.snapshot("unlock");
    }

    return this.snapshot(result);
  }

  private fail(reason: FailReason) {
    return { ...this.snapshot("fail"), reason };
  }

  private snapshot(result: LockResult): LockStep {
    return {
      result,
      pairIndex: this.pairIndex,
      count: this.count,
      target: this.target.value,
    };
  }
}
