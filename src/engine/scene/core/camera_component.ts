import { mat4, vec4 } from "gl-matrix";
import Component from "@engine/scene/component";

export default class CameraComponent extends Component {
  public projection: mat4;
  private leftRightBottomTop: vec4;
  private cameraScale: number = 100;

  constructor() {
    super();
    this.projection = mat4.create();
    this.leftRightBottomTop = [-8, 8, -6, 6];
  }

  public get view() : mat4 {
    return this.gameObject.transform.worldModelMatrix;
  }

  public get extents() : vec4 {
    return this.leftRightBottomTop;
  }

  public set scale(value: number) {
    this.cameraScale = value;
  }

  public get scale() : number {
    return this.cameraScale;
  }

  private updateCamera() {
    var windowWidth = this.scene.renderer.width / this.cameraScale; 
    var windowHeight = this.scene.renderer.height / this.cameraScale;

    this.leftRightBottomTop = [-windowWidth, windowWidth, -windowHeight, windowHeight];
    mat4.ortho(this.projection ,-windowWidth, windowWidth, -windowHeight, windowHeight, 0, 20);
  }

  public update(dT: number): void {
    this.updateCamera();
  }

}
