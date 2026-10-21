import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import PixiApp from "./core/App";
import { KEYPAD } from "./config";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

await document.fonts.load(`32px "${KEYPAD.text.fontFamily}"`);

const pixiApp = new PixiApp();

Object.assign(globalThis, { __PIXI_APP__: pixiApp });

await pixiApp.begin();
