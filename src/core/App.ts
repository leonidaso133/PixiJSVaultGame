import { Application } from "pixi.js";
import AssetLoader from "./AssetLoader";
import Game from "../scenes/Game";

export interface SceneUtils {
  assetLoader: AssetLoader;
}

export default class App extends Application {
  private game!: Game;

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

    this.game = new Game({ assetLoader: new AssetLoader() });
    this.stage.addChild(this.game);

    await this.game.load();

    this.game.start();

    this.renderer.on("resize", (width: number, height: number) =>
      this.game.onResize(width, height),
    );

    this.ticker.add((ticker) => this.game.update(ticker.deltaTime));
  }
}
