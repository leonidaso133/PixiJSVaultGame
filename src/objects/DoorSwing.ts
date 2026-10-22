import {
  Color,
  Container,
  Graphics,
  Matrix,
  PerspectiveMesh,
  Renderer,
  RenderTexture,
  Texture,
} from "pixi.js";
import { DESIGN, DOOR, SWING } from "../config";

type Point = [number, number];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const smoothstep = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from), 0, 1);

  return t * t * (3 - 2 * t);
};

export default class DoorSwing extends Container {
  label = "DoorSwing";

  private readonly target: RenderTexture;
  private readonly mesh: PerspectiveMesh;
  private readonly rim = new Graphics();
  private readonly bakeTransform: Matrix;
  private readonly fit: Matrix;
  private readonly morphMatrix = new Matrix();
  private readonly shadeColor = new Color();
  private readonly corners: Point[];
  private readonly facing: number;
  private readonly outline: Point[];
  private readonly center: Point = [
    DESIGN.width / 2 - DOOR.position.x,
    DESIGN.height / 2 - DOOR.position.y,
  ];
  private amount = 0;

  constructor(
    private renderer: Renderer,
    private back: Texture,
  ) {
    super();

    const { width, height } = back;
    const { x: px, y: py } = DOOR.closed.pivot;
    const { segments, radius } = SWING.rim;

    this.target = RenderTexture.create({
      width,
      height,
      resolution: SWING.resolution,
    });
    this.mesh = new PerspectiveMesh({
      texture: this.target,
      verticesX: SWING.vertices,
      verticesY: SWING.vertices,
    });
    this.bakeTransform = new Matrix().translate(px, py);
    this.corners = [
      [-px, -py],
      [width - px, -py],
      [width - px, height - py],
      [-px, height - py],
    ];
    this.outline = Array.from({ length: segments }, (_, i) => {
      const a = (i / segments) * Math.PI * 2;

      return [radius.x * Math.cos(a), radius.y * Math.sin(a)];
    });
    this.facing = Math.sign(DoorSwing.area(this.corners));
    this.fit = this.computeFit();

    this.addChild(this.rim, this.mesh);
    this.visible = false;
  }

  get progress() {
    return this.amount;
  }

  set progress(value: number) {
    const theta = this.theta(value);
    const morph = smoothstep(SWING.morph, 1, value);
    const corners = this.corners.map(([x, y]) => this.project(x, y, theta));
    const shade = 1 - SWING.shade * (1 - Math.abs(Math.cos(theta)));
    const level = shade + (1 - shade) * morph;
    const { a, d, tx, ty } = this.fit;

    this.amount = value;

    if (Math.abs(DoorSwing.area(corners)) < 1) {
      corners[0][0] -= 1;
      corners[3][0] -= 1;
    }

    this.mesh.texture =
      DoorSwing.area(corners) * this.facing < 0 ? this.back : this.target;
    this.mesh.setCorners(
      ...(corners.flat() as Parameters<PerspectiveMesh["setCorners"]>),
    );
    this.drawRim(theta);

    this.shadeColor.setValue([level, level, level]);
    this.mesh.tint = this.shadeColor;
    this.rim.tint = this.shadeColor;

    this.morphMatrix.set(
      1 + (a - 1) * morph,
      0,
      0,
      1 + (d - 1) * morph,
      tx * morph,
      ty * morph,
    );
    this.setFromMatrix(this.morphMatrix);
  }

  bake(face: Container) {
    this.renderer.render({
      container: face,
      target: this.target,
      clear: true,
      clearColor: [0, 0, 0, 0],
      transform: this.bakeTransform,
    });
  }

  override destroy() {
    super.destroy({ children: true });
    this.target.destroy(true);
  }

  private theta(progress: number) {
    return (progress * SWING.angle * Math.PI) / 180;
  }

  private project(x: number, y: number, theta: number, depth = 0): Point {
    const { hinge, focal, flip } = SWING;
    const [cx, cy] = this.center;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const side = clamp(cos / flip, -1, 1);
    const reach = hinge - x;
    const px = hinge - reach * cos - sin * side * depth;
    const pz = -reach * sin + cos * side * depth;
    const scale = focal / (focal + pz);

    return [cx + (px - cx) * scale, cy + (y - cy) * scale];
  }

  private silhouette(theta: number) {
    const points = this.outline.flatMap(([x, y]) => [
      this.project(x, y, theta),
      this.project(x, y, theta, SWING.thickness),
    ]);

    return DoorSwing.hull(points);
  }

  private drawRim(theta: number) {
    const { color, edge } = SWING.rim;

    this.rim.clear();
    this.rim.visible = theta > 0;

    if (!this.rim.visible) return;

    this.rim.poly(this.silhouette(theta).flat()).fill(color).stroke(edge);
  }

  private computeFit() {
    const points = this.silhouette(this.theta(1));
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const sx = SWING.target.width / (Math.max(...xs) - minX);
    const sy = SWING.target.height / (Math.max(...ys) - minY);

    return new Matrix(
      sx,
      0,
      0,
      sy,
      SWING.target.x - minX * sx,
      SWING.target.y - minY * sy,
    );
  }

  private static area(points: Point[]) {
    return points.reduce((sum, [x, y], i) => {
      const [nx, ny] = points[(i + 1) % points.length];

      return sum + x * ny - nx * y;
    }, 0);
  }

  private static hull(points: Point[]) {
    const sorted = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cross = (o: Point, a: Point, b: Point) =>
      (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (list: Point[]) =>
      list.reduce<Point[]>((chain, p) => {
        while (
          chain.length >= 2 &&
          cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0
        ) {
          chain.pop();
        }
        chain.push(p);

        return chain;
      }, []);
    const lower = half(sorted);
    const upper = half([...sorted].reverse());

    return [...lower.slice(0, -1), ...upper.slice(0, -1)];
  }
}
