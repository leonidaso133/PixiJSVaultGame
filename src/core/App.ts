import gsap from "gsap";
import { Application, Renderer } from "pixi.js";
import AssetLoader from "./AssetLoader";
import Viewport from "./Viewport";
import Game from "../scenes/Game";
import { DISPLAY, TICKER } from "../config";

export interface SceneUtils {
  assetLoader: AssetLoader;
  viewport: Viewport;
  renderer: Renderer;
}

export default class App extends Application {
  private game!: Game;
  readonly viewport = new Viewport();

  async begin() {
    await this.init({
      canvas: document.querySelector("#app") as HTMLCanvasElement,
      autoDensity: true,
      resolution: App.resolution(),
      resizeTo: window,
      antialias: true,
      powerPreference: "high-performance",
      background: 0x05081a,
    });

    this.watchResolution();
    this.ticker.stop();
    gsap.ticker.lagSmoothing(TICKER.lagThreshold, TICKER.adjustedLag);

    this.viewport.update(this.screen.width, this.screen.height);

    this.game = new Game({
      assetLoader: new AssetLoader(),
      viewport: this.viewport,
      renderer: this.renderer,
    });
    this.stage.addChild(this.game);

    this.viewport.on("resize", (layout) => this.game.onResize(layout));
    this.renderer.on("resize", (width: number, height: number) =>
      this.viewport.update(width, height),
    );

    gsap.ticker.add((_time, deltaMs) => {
      this.game.update(deltaMs / 1000);
      this.ticker.update();
    });

    await this.game.load();
    await this.game.start();
  }

  private watchResolution() {
    matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
      "change",
      () => {
        this.renderer.resolution = App.resolution();
        this.resize();
        this.watchResolution();
      },
      { once: true },
    );
  }

  private static resolution() {
    return Math.min(window.devicePixelRatio, DISPLAY.maxResolution);
  }
}
