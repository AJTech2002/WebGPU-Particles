import { Vector2, Vector3 } from "@math";
import Scene from "../scene";
import { vec4 } from "gl-matrix";

enum MouseButtons {
  Left = 1,
  Middle = 2,
  Right = 4,
  None = 8,
}

export default class Input {
  public inputMappings: any;
  public scene: Scene | null;
  public mousePosition: Vector2;
  public mouseButtons: MouseButtons = MouseButtons.None;

  constructor(scene: Scene) {
    this.inputMappings = {};
    this.scene = scene;
    this.keyIsPressed = this.keyIsPressed.bind(this);
    this.mousePosition = new Vector2(0, 0);
  }

  mapMouse(inputMouseButton: number): number {
    return Math.pow(2, inputMouseButton);
  }

  setup() {
    document.addEventListener("keydown", (e) => {
      if (!this.keyIsPressed(e.key.toLowerCase()))
        this.scene?.inputEvent(0, e.key.toLowerCase());
      this.inputMappings[e.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (e) => {
      if (this.keyIsPressed(e.key.toLowerCase()))
        this.scene?.inputEvent(1, e.key.toLowerCase());
      this.inputMappings[e.key.toLowerCase()] = false;
    });

    document.addEventListener("mousemove", (e) => {
      this.mousePosition = new Vector2(e.clientX, e.clientY);
    });

    document.addEventListener("mousedown", (e) => {
      this.mouseButtons |= this.mapMouse(e.button);
    });

    document.addEventListener("mouseup", (e) => {
      this.mouseButtons &= ~this.mapMouse(e.button);
    });

    window.addEventListener("blur", (e) => {
      this.inputMappings = {};
    });
  }

  getMouseButton(mouseButton: number): boolean {
    if (this.mouseButtons & this.mapMouse(mouseButton)) return true;
    return false;
  }

  getAdjustedMousePosition(): Vector2 {
    let mouse = new Vector2();
    mouse.x = (this!.mousePosition.x / window.innerWidth) * 2 - 1;
    mouse.y = -(this!.mousePosition.y / window.innerHeight) * 2 + 1;
    return mouse;
  }

  getRawHorizontal(): number {
    if (this.keyIsPressed("A")) return -1;
    if (this.keyIsPressed("D")) return 1;
    return 0;
  }

  getRawVertical(): number {
    if (this.keyIsPressed("W")) return 1;
    if (this.keyIsPressed("S")) return -1;
    return 0;
  }

  mouseToWorld = (z: number): Vector3 => {
    if (this.scene === null) {
        return new Vector3(0, 0, 0);
    }


    const canvas = this.scene!.engine.outputCanvas;

    var rect = canvas.getBoundingClientRect();
    var x = this.mousePosition.x - rect.left;
    var y = this.mousePosition.y - rect.top;
    var bounds : vec4 = this.scene.activeCamera!.extents;
    var width = canvas.width;
    var height = canvas.height;
    var xNDC = x / width;
    var yNDC = 1 - ( y / height);
    var xWorld = bounds[0] + (bounds[1] - bounds[0]) * xNDC;
    var yWorld = bounds[2] + (bounds[3] - bounds[2]) * yNDC;
    var zWorld = 0;
    return new Vector3(xWorld, yWorld, z);
  };

  keyIsPressed(key: string): boolean {
    if (
      key.toLowerCase() in this.inputMappings &&
      this.inputMappings[key.toLowerCase()] === true
    )
      return true;
    return false;
  }
}