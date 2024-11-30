import Mesh from "./mesh";
import Pass from "../pass";
import Scene from "../scene";

export default class InstancedMesh extends Mesh {
  protected instanceCount: number = 0;
  protected objectBuffer!: GPUBuffer;
  protected computeBindGroup!: GPUBindGroup;

  constructor (device: GPUDevice, pass: Pass, scene: Scene) {
    super(device, pass, scene);
  }

  public getInstanceCount() : number {
    return this.instanceCount;
  }

  public getObjectBuffer() : GPUBuffer {
    return this.objectBuffer;
  }

  public setObjectData(data: Float32Array) {
    this.device.queue.writeBuffer(this.objectBuffer, 0, data, 0, data.length);
  }

  public getComputeBindGroup() : GPUBindGroup {
    return this.computeBindGroup;
  }
}