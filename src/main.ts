import * as PIXI from "pixi.js";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { PixiPlugin } from "gsap/PixiPlugin";
import PixiApp from "./core/App";
import { BANNER, EASES, KEYPAD } from "./config";

gsap.registerPlugin(PixiPlugin, CustomEase, Physics2DPlugin);
PixiPlugin.registerPIXI(PIXI);
CustomEase.create("vaultStep", EASES.vaultStep);

await Promise.all([
  document.fonts.load(`32px "${KEYPAD.text.fontFamily}"`),
  document.fonts.load(
    `${BANNER.font.fontWeight} 32px "${BANNER.font.fontFamily}"`,
  ),
]);

const pixiApp = new PixiApp();

Object.assign(globalThis, { __PIXI_APP__: pixiApp });

await pixiApp.begin();
