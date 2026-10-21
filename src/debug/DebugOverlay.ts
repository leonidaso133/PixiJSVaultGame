import gsap from "gsap";
import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { DOOR, HANDLE, KEYPAD, SAFE_RECT, SHADOW } from "../config";
import GameStateMachine from "../logic/GameStateMachine";
import VaultScene from "../scenes/VaultScene";
import previewStartUrl from "../../dreamshot challenge/previews/preview start.jpg?url";
import previewWinUrl from "../../dreamshot challenge/previews/preview win.jpg?url";

export default class DebugOverlay extends Container {
  label = "DebugOverlay";

  private preview = new Sprite();
  private textures: Record<string, Texture> = {};

  constructor(
    private vault: VaultScene,
    private fsm: GameStateMachine,
  ) {
    super();

    this.preview.alpha = 0.5;
    this.preview.visible = false;

    const guides = new Graphics()
      .rect(SAFE_RECT.x, SAFE_RECT.y, SAFE_RECT.width, SAFE_RECT.height)
      .stroke({ width: 3, color: 0x00ff66 })
      .rect(
        KEYPAD.glass.x,
        KEYPAD.glass.y,
        KEYPAD.glass.width,
        KEYPAD.glass.height,
      )
      .stroke({ width: 1, color: 0xff00ff });

    this.cross(guides, DOOR.position.x, DOOR.position.y, 0xff3333);
    this.cross(
      guides,
      DOOR.position.x + SHADOW.offset.x,
      DOOR.position.y + SHADOW.offset.y,
      0x33aaff,
    );

    this.addChild(this.preview, guides);
    vault.addChild(this);
  }

  async load() {
    this.textures["1"] = await Assets.load<Texture>(previewStartUrl);
    this.textures["2"] = await Assets.load<Texture>(previewWinUrl);
    this.show("1");

    window.addEventListener("keydown", (event) => {
      if (event.key === "r") this.spin();
      else this.show(event.key);
    });

    Object.assign(globalThis, {
      __VAULT__: {
        gsap,
        vault: this.vault,
        door: this.vault.door,
        handle: this.vault.door.handle,
        overlay: this,
        fsm: this.fsm,
        lock: this.fsm.lock,
      },
    });
  }

  private show(key: string) {
    if (key === "0") this.preview.visible = false;
    if (!this.textures[key]) return;

    this.preview.texture = this.textures[key];
    this.preview.visible = true;
    this.vault.door.open.visible = key === "2";
    this.vault.door.closed.visible = key !== "2";
    this.vault.door.handle.visible = key !== "2";
  }

  private spin() {
    const handle = this.vault.door.handle;

    gsap.to(handle, {
      angle: handle.angle + HANDLE.stepAngle,
      duration: 0.4,
      ease: "power2.inOut",
      overwrite: true,
    });
  }

  private cross(g: Graphics, x: number, y: number, color: number) {
    g.moveTo(x - 20, y)
      .lineTo(x + 20, y)
      .moveTo(x, y - 20)
      .lineTo(x, y + 20)
      .stroke({ width: 2, color });
  }
}
