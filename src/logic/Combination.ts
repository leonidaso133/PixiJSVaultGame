import { GAME } from "../config";

export type Direction = "CW" | "CCW";

export interface Pair {
  value: number;
  dir: Direction;
}

export default class Combination {
  constructor(readonly pairs: readonly Pair[]) {}

  static random() {
    const span = GAME.maxValue - GAME.minValue + 1;
    let dir: Direction = Math.random() < 0.5 ? "CW" : "CCW";
    const pairs: Pair[] = [];

    for (let i = 0; i < GAME.pairs; i++) {
      pairs.push({
        value: GAME.minValue + Math.floor(Math.random() * span),
        dir,
      });
      dir = Combination.opposite(dir);
    }

    return new Combination(pairs);
  }

  static opposite(dir: Direction): Direction {
    return dir === "CW" ? "CCW" : "CW";
  }

  toString() {
    return this.pairs.map((pair) => `${pair.value} ${pair.dir}`).join(", ");
  }
}
