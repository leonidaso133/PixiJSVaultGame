import gsap from "gsap";
import { Application } from "pixi.js";
import AssetLoader from "./AssetLoader";
import Viewport from "./Viewport";
import Game from "../scenes/Game";
import { TICKER } from "../config";

export interface SceneUtils {
  assetLoader: AssetLoader;
  viewport: Viewport;
}

export default class App extends Application {
  private game!: Game;
  readonly viewport = new Viewport();

  async begin() {
    await this.init({
      canvas: document.querySelector("#app") as HTMLCanvasElement,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      resizeTo: window,
      antialias: true,
      powerPreference: "high-performance",
      background: 0x05081a,
    });

    this.ticker.stop();
    gsap.ticker.add(() => this.ticker.update());
    gsap.ticker.lagSmoothing(TICKER.lagThreshold, TICKER.adjustedLag);

    this.viewport.update(this.screen.width, this.screen.height);

    this.game = new Game({
      assetLoader: new AssetLoader(),
      viewport: this.viewport,
    });
    this.stage.addChild(this.game);

    this.viewport.on("resize", (layout) => this.game.onResize(layout));
    this.renderer.on("resize", (width: number, height: number) =>
      this.viewport.update(width, height),
    );

    this.ticker.add((ticker) => this.game.update(ticker.deltaTime));

    await this.game.load();
    await this.game.start();
  }
}
