import { Container } from "pixi.js";
import { SceneUtils } from "../core/App";
import { Layout } from "../core/Viewport";
import Ambience from "../fx/Ambience";
import ScreenFx from "../fx/ScreenFx";
import GpuWarmup from "../fx/GpuWarmup";
import HandleInput, { Hover } from "../input/HandleInput";
import { Direction } from "../logic/Combination";
import GameStateMachine, { GameState } from "../logic/GameStateMachine";
import Timer from "../logic/Timer";
import Backdrop from "../objects/Backdrop";
import Loader from "../ui/Loader";
import MuteButton from "../ui/MuteButton";
import Intro from "./Intro";
import VaultScene from "./VaultScene";

export default class Game extends Container {
  label = "Game";

  private loader?: Loader;
  private backdrop?: Backdrop;
  private vault?: VaultScene;
  private fx?: ScreenFx;
  private mute?: MuteButton;
  private fsm?: GameStateMachine;
  private ambience?: Ambience;
  private readonly timer = new Timer();

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    this.loader = new Loader();
    this.addChild(this.loader);
    this.onResize(this.utils.viewport.layout);

    await this.utils.assetLoader.loadAssets((progress) =>
      this.loader?.progress(progress),
    );
  }

  async start() {
    await this.loader?.finish();
    this.loader?.destroy();
    this.loader = undefined;

    this.backdrop = new Backdrop();
    this.vault = new VaultScene(this.utils.renderer);
    this.fx = new ScreenFx();
    this.mute = new MuteButton();
    this.ambience = new Ambience(this.vault);
    this.addChild(this.backdrop, this.vault, this.fx, this.mute);

    this.onResize(this.utils.viewport.layout);

    const input = new HandleInput(this.vault.door);

    this.fsm = new GameStateMachine(this.vault, input, this.timer, this.fx);
    this.wire(input, this.fsm, this.vault, this.ambience);

    if (
      import.meta.env.DEV &&
      new URLSearchParams(location.search).has("debug")
    ) {
      const { default: DebugOverlay } = await import("../debug/DebugOverlay");
      const overlay = new DebugOverlay(this.vault, this.fsm);
      await overlay.load();
    }

    const intro = new Intro(this.vault, this.ambience.lamps, [
      this.backdrop,
      this.mute,
    ]);

    intro.setup();
    await GpuWarmup.run(this.utils.renderer, this, this.vault.door);
    await intro.play();

    this.ambience.start();
    void this.fsm.run();
  }

  update(deltaSeconds: number) {
    this.timer.update(deltaSeconds);
    this.vault?.keypad.setTime(this.timer.elapsed);
  }

  onResize(layout: Layout) {
    this.loader?.applyLayout(layout);
    this.backdrop?.applyLayout(layout);
    this.vault?.applyLayout(layout);
    this.fx?.applyLayout(layout);
    this.mute?.applyLayout(layout);
  }

  private wire(
    input: HandleInput,
    fsm: GameStateMachine,
    vault: VaultScene,
    ambience: Ambience,
  ) {
    const { arrows, keypad, door } = vault;

    arrows.setHint(matchMedia("(hover: none)").matches);
    input.on("interact", () => {
      arrows.setHint(false);
      if (fsm.state === "Idle") ambience.arm();
    });
    input.on("hover", (hover: Hover) => {
      arrows.show(hover?.side ?? null);
      door.handle.setHover(hover?.onHandle ?? false);
    });
    input.on("step", (dir: Direction) => arrows.nudge(dir));
    fsm.on("lock", (step) => keypad.leds.onLock(step));
    fsm.on("state", (state: GameState) => {
      if (state === "Idle") {
        ambience.resume();
        ambience.arm();
      } else if (state === "Input") {
        ambience.disarm();
      } else if (state === "Unlocking" || state === "Failing") {
        ambience.pause();
      }
    });
    document.addEventListener("visibilitychange", () => {
      this.timer.suspended = document.hidden;
    });
  }
}
