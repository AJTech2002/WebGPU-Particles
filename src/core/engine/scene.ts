import { mat4, vec4 } from "gl-matrix";
import { Renderer } from "./renderer";

export interface CameraData {
  view: mat4;
  projection: mat4;
  transform: mat4;
  buffer: GPUBuffer;
  
  leftRightBottomTop: vec4;
}

export default class Scene {

  protected device: GPUDevice;
  protected renderer: Renderer;

  protected cameraData: CameraData;

  constructor(renderer: Renderer) {

    this.renderer = renderer;
    this.device = renderer.device;

    this.cameraData = {
      buffer: this.device.createBuffer({
        size: 64 * 2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
      view: mat4.create(),
      projection: mat4.create(),
      transform: mat4.create(),
      leftRightBottomTop: [-8, 8, -6, 6],
    }

    this.cameraData.projection = mat4.create();

    
    mat4.ortho(this.cameraData.projection , -8, 8, -6, 6, 0, 20);

    this.cameraData.view = mat4.create();
    mat4.lookAt(this.cameraData.view, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
    
  }

  public getCamera() : CameraData {
    return this.cameraData;
  }

  render (commandEncoder: GPUCommandEncoder, context: GPUCanvasContext) {
    this.device.queue.writeBuffer(this.cameraData.buffer, 0, <ArrayBuffer>this.cameraData.view);
    this.device.queue.writeBuffer(this.cameraData.buffer, 64, <ArrayBuffer>this.cameraData.projection);
  }

}