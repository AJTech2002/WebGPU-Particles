import { mat4, vec4 } from "gl-matrix";
import { Renderer } from "./renderer";

export interface CameraData {
  view: mat4;
  projection: mat4;
  transform: mat4;
  buffer: GPUBuffer;
  
  leftRightBottomTop: vec4;
}

export default class  Scene {

  protected device: GPUDevice;
  protected renderer: Renderer;

  protected cameraData: CameraData;

  protected cameraScale: number = 200;

  constructor(renderer: Renderer) {

    this.renderer = renderer;
    this.device = renderer.device;

    this.cameraData = {
      buffer: this.device.createBuffer({
        size: 64  + 64 + 16, // 16 for alignment with mat4x4 (which is vec4x4)
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
      view: mat4.create(),
      projection: mat4.create(),
      transform: mat4.create(),
      leftRightBottomTop: [-8, 8, -6, 6],
    }

    this.cameraData.projection = mat4.create();

    
    this.renderer.canvas.width = window.innerWidth;
    this.renderer.canvas.height = window.innerHeight;


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

  public updateCamera() {
    var windowWidth = window.innerWidth/this.cameraScale;
    var windowHeight = window.innerHeight/this.cameraScale;

    // updat canvas size
    this.renderer.canvas.width = window.innerWidth;
    this.renderer.canvas.height = window.innerHeight;

    this.cameraData.leftRightBottomTop = [-windowWidth, windowWidth, -windowHeight, windowHeight];
    mat4.ortho(this.cameraData.projection ,-windowWidth, windowWidth, -windowHeight, windowHeight, 0, 20);
  }

  public getCamera() : CameraData {
    return this.cameraData;
  } 

  private time: number = 0;

  render (commandEncoder: GPUCommandEncoder, context: GPUCanvasContext) {

    const currentTime = performance.now() / 1000;
    const deltaTime = currentTime - this.time;
    this.time = currentTime;

    this.device.queue.writeBuffer(this.cameraData.buffer, 0, <ArrayBuffer>this.cameraData.view);
    this.device.queue.writeBuffer(this.cameraData.buffer, 64, <ArrayBuffer>this.cameraData.projection);
    this.device.queue.writeBuffer(this.cameraData.buffer, 128, new Float32Array([performance.now() / 1000])); // time 
  }

}