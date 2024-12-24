import { mat4, vec4 } from "gl-matrix";
import Component from "@engine/scene/component";

export default class CameraComponent extends Component {
  public projection: mat4;
  protected cameraScale: number = 200;
  private leftRightBottomTop: vec4;

  constructor() {
    super();
    this.projection = mat4.create();
    this.leftRightBottomTop = [-8, 8, -6, 6];

    //TODO: Move this into a sub-class
    // listen for zoom events and change scaling
    window.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        this.cameraScale += 5;
      } else {
        this.cameraScale -= 5;
      }

      this.updateCamera();
    });
  }

  public get view() : mat4 {
    return this.gameObject.transform.worldModelMatrix;
  }

  private updateCamera() {
    var windowWidth = window.innerWidth/this.cameraScale;
    var windowHeight = window.innerHeight/this.cameraScale;

    this.leftRightBottomTop = [-windowWidth, windowWidth, -windowHeight, windowHeight];
    mat4.ortho(this.projection ,-windowWidth, windowWidth, -windowHeight, windowHeight, 0, 20);
  }

  public update(dT: number): void {
    this.updateCamera();
  }

}