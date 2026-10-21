import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import PixiApp from "./core/App";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const pixiApp = new PixiApp();
await pixiApp.begin();

// @ts-expect-error expose app for PixiJS DevTools
globalThis.__PIXI_APP__ = pixiApp;
