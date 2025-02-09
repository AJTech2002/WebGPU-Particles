import { Vector2, Vector3 } from "@math";
import Scene from "../scene";
import { vec4 } from "gl-matrix";

export default class Input {
  public inputMappings: any;
  public scene: Scene | null;
  public mousePosition: Vector2;

  private leftMouse!: boolean;
  private rightMouse!: boolean;
  private middleMouse!: boolean;

  constructor(scene: Scene) {
    this.inputMappings = {};
    this.scene = scene;
    this.keyIsPressed = this.keyIsPressed.bind(this);
    this.mousePosition = new Vector2(0, 0);
  }

  dispose() {
    this.inputMappings = {};
    this.scene = null;
  }

  mapMouse(inputMouseButton: number): number {
    return Math.pow(2, inputMouseButton);
  }

  setup() {

    const canvas = this.scene!.engine.outputCanvas;

    canvas.addEventListener("keydown", (e) => {

      if (this.scene === null) {
        return;
      }

      if (!this.keyIsPressed(e.key.toLowerCase()))
        this.scene?.inputEvent(0, e.key.toLowerCase());
      this.inputMappings[e.key.toLowerCase()] = true;
    });



    canvas.addEventListener("keyup", (e) => {
      if (this.scene === null) {
        return;
      }

      if (this.keyIsPressed(e.key.toLowerCase()))
        this.scene?.inputEvent(1, e.key.toLowerCase());
      this.inputMappings[e.key.toLowerCase()] = false;
    });

    document.addEventListener("mousemove", (e) => {
      if (this.scene === null) {
        return;
      }

      this.mousePosition = new Vector2(e.clientX, e.clientY);
      this.scene.mouseEvent(2, 0)
    });

    canvas.addEventListener("mousedown", (e) => {
        
      if (this.scene === null) {
        return;
      }


      if (e.button === 0) {
        this.leftMouse = true;
      }
      if (e.button === 1) {
        this.rightMouse = true;
      }
      if (e.button === 2) {
        this.middleMouse = true;
      }

      this.scene.mouseEvent(0, e.button);
    });

    canvas.addEventListener("mouseup", (e) => {
      if (this.scene === null) {
        return;
      }

      if (e.button === 0) {
        this.leftMouse = false;
      }
      if (e.button === 1) {
        this.rightMouse = false;
      }
      if (e.button === 2) {
        this.middleMouse = false;
      }
      
      this.scene.mouseEvent(1, e.button);
    });

    window.addEventListener("blur", (e) => {
      // Clear all input mappings
      if (this.scene === null) {
        return;
      }

      this.inputMappings = {};
    });
  }

  getMouseButton(mouseButton: number): boolean {
    if (mouseButton === 0) return this.leftMouse;
    if (mouseButton === 1) return this.rightMouse;
    if (mouseButton === 2) return this.middleMouse;
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

  mouseToWorld = (z: number, absolute: boolean = true): Vector3 => {
    if (this.scene === null) {
        return new Vector3(0, 0, 0);
    }


    const canvas = this.scene!.engine.outputCanvas;

    const rect = canvas.getBoundingClientRect();
    const x = this.mousePosition.x - rect.left;
    const y = this.mousePosition.y - rect.top;
    const bounds : vec4 = this.scene.activeCamera!.extents;
    const width = canvas.width;
    const height = canvas.height;
    const xNDC = x / width;
    const yNDC = 1 - ( y / height);
    const xWorld = bounds[0] + (bounds[1] - bounds[0]) * xNDC;
    const yWorld = bounds[2] + (bounds[3] - bounds[2]) * yNDC;
    const zWorld = 0;
    // return new Vector3(xWorld, yWorld, z).sub(this.scene.activeCamera!.gameObject.transform.position.clone());
    if (absolute) 
      return new Vector3(xWorld, yWorld, z).sub(this.scene.activeCamera!.gameObject.transform.position.clone());
    else 
      return new Vector3(xWorld, yWorld, zWorld);
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
