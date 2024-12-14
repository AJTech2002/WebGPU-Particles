import Pass from "../pass";
import Scene from "../scene";



export default class Mesh {
  // Must be created in a constructor
  protected vertexBuffer!: GPUBuffer;
  protected vertices!: Float32Array;
  protected vertexCount!: number;
  protected device!: GPUDevice;

  // The uniforms for this mesh (abstract into Material class later)
  protected bindGroup!: GPUBindGroup;
  protected pass!: Pass;
  protected scene!: Scene;

  constructor(device: GPUDevice, pass: Pass, scene: Scene) {
    this.device = device;
    this.pass = pass;
    this.scene = scene;
  }

  public getVertexBuffer(): GPUBuffer {
    return this.vertexBuffer;
  }

  public getVertexCount(): number {
    return this.vertexCount;
  }

  public getVertices(): Float32Array {
    return this.vertices;
  }

  public getRenderBindGroup(): GPUBindGroup {
    return this.bindGroup;
  }
}
