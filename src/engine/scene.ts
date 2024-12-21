import { mat4, vec4 } from "gl-matrix";
import { Renderer } from "@renderer/renderer";

export interface CameraData {
  view: mat4;
  projection: mat4;
  transform: mat4;
  
  leftRightBottomTop: vec4;
}

export default class  Scene {

  protected renderer: Renderer;
  protected cameraData: CameraData;
  protected cameraScale: number = 200;
  private time: number = 0;

  constructor(renderer: Renderer) {

    this.renderer = renderer;

    this.cameraData = {
      view: mat4.create(),
      projection: mat4.create(),
      transform: mat4.create(),
      leftRightBottomTop: [-8, 8, -6, 6],
    }

    this.cameraData.projection = mat4.create();

    this.updateCamera();

    // add a callback for window size and change camera
    window.addEventListener("resize", () => {
      this.updateCamera();
    });

    // listen for zoom events and change scaling
    window.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        this.cameraScale += 5;
      } else {
        this.cameraScale -= 5;
      }

      console.log(this.cameraScale);

      this.updateCamera();
    });
    
  }
  
  public get activeCamera() {
    return this.cameraData;
  }

  private updateCamera() {
    var windowWidth = window.innerWidth/this.cameraScale;
    var windowHeight = window.innerHeight/this.cameraScale;

    this.cameraData.leftRightBottomTop = [-windowWidth, windowWidth, -windowHeight, windowHeight];
    mat4.ortho(this.cameraData.projection ,-windowWidth, windowWidth, -windowHeight, windowHeight, 0, 20);
  }


  render (dT: number) {
    console.log("Scene Render");
    this.time += dT;
  }

}