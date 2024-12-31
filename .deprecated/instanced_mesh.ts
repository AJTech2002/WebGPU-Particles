import Mesh from "../src/core/engine/mesh/mesh";
import Pass from "../src/core/engine/pass";
import Scene from "../src/core/engine/scene";

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

  public getComputeBindGroup() : GPUBindGroup {
    return this.computeBindGroup;
  }
}