import * as PIXI from "pixi.js";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { PixiPlugin } from "gsap/PixiPlugin";
import PixiApp from "./core/App";
import { EASES, KEYPAD } from "./config";

gsap.registerPlugin(PixiPlugin, CustomEase);
PixiPlugin.registerPIXI(PIXI);
CustomEase.create("vaultStep", EASES.vaultStep);

await document.fonts.load(`32px "${KEYPAD.text.fontFamily}"`);

const pixiApp = new PixiApp();

Object.assign(globalThis, { __PIXI_APP__: pixiApp });

await pixiApp.begin();
