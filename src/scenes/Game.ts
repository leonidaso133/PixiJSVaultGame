import gsap from "gsap";
import { Container, Text } from "pixi.js";
import { SceneUtils } from "../core/App";
import { Layout } from "../core/Viewport";
import { INTRO, LOADING } from "../config";
import ScreenFx from "../fx/ScreenFx";
import HandleInput, { Hover } from "../input/HandleInput";
import { Direction } from "../logic/Combination";
import GameStateMachine from "../logic/GameStateMachine";
import Timer from "../logic/Timer";
import Backdrop from "../objects/Backdrop";
import MuteButton from "../ui/MuteButton";
import VaultScene from "./VaultScene";

export default class Game extends Container {
  label = "Game";

  private loadingText?: Text;
  private backdrop?: Backdrop;
  private vault?: VaultScene;
  private fx?: ScreenFx;
  private mute?: MuteButton;
  private fsm?: GameStateMachine;
  private readonly timer = new Timer();

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    this.loadingText = new Text({
      text: "Loading...",
      style: LOADING,
      resolution: 2,
    });
    this.loadingText.anchor.set(0.5);
    this.addChild(this.loadingText);
    this.onResize(this.utils.viewport.layout);

    await this.utils.assetLoader.loadAssets();
  }

  async start() {
    this.removeChildren();
    this.loadingText?.destroy();
    this.loadingText = undefined;

    this.backdrop = new Backdrop();
    this.vault = new VaultScene(this.utils.renderer);
    this.fx = new ScreenFx();
    this.mute = new MuteButton();
    this.addChild(this.backdrop, this.vault, this.fx, this.mute);

    this.onResize(this.utils.viewport.layout);

    const input = new HandleInput(this.vault.door);

    this.fsm = new GameStateMachine(this.vault, input, this.timer, this.fx);
    this.wire(input, this.fsm, this.vault);

    gsap.from([this.backdrop, this.vault, this.mute], {
      alpha: 0,
      duration: INTRO.duration,
      ease: INTRO.ease,
    });

    if (
      import.meta.env.DEV &&
      new URLSearchParams(location.search).has("debug")
    ) {
      const { default: DebugOverlay } = await import("../debug/DebugOverlay");
      const overlay = new DebugOverlay(this.vault, this.fsm);
      await overlay.load();
    }

    void this.fsm.run();
  }

  update(deltaSeconds: number) {
    this.timer.update(deltaSeconds);
    this.vault?.keypad.setTime(this.timer.elapsed);
  }

  onResize(layout: Layout) {
    this.loadingText?.position.set(
      layout.screenWidth / 2,
      layout.screenHeight / 2,
    );
    this.backdrop?.applyLayout(layout);
    this.vault?.applyLayout(layout);
    this.fx?.applyLayout(layout);
    this.mute?.applyLayout(layout);
  }

  private wire(input: HandleInput, fsm: GameStateMachine, vault: VaultScene) {
    const { arrows, keypad, door } = vault;

    arrows.setHint(matchMedia("(hover: none)").matches);
    input.on("interact", () => arrows.setHint(false));
    input.on("hover", (hover: Hover) => {
      arrows.show(hover?.side ?? null);
      door.handle.setHover(hover?.onHandle ?? false);
    });
    input.on("step", (dir: Direction) => arrows.nudge(dir));
    fsm.on("lock", (step) => keypad.leds.onLock(step));
  }
}
