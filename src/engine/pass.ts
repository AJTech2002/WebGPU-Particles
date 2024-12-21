export default class Pass {

  protected device: GPUDevice;
  protected bindGroupLayout!: GPUBindGroupLayout;

  constructor (device: GPUDevice, renderFormat: GPUTextureFormat) {
    this.device = device;
    // override
  }

  public run (commandEncoder: GPUCommandEncoder, context: GPUCanvasContext) {
    // override
  }

  public getBindGroupLayout() : GPUBindGroupLayout {  
    return this.bindGroupLayout;
  }
}