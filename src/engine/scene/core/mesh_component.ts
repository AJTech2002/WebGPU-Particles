import { device } from "@engine/engine";
import Material from "@engine/renderer/material";
import Component from "@engine/scene/component";
export default class Mesh extends Component {

  public name: string = "Mesh";

  // Must be created in a constructor
  protected vertexBuffer!: GPUBuffer;
  protected vertices!: Float32Array;
  protected vertexCount!: number;

  private _material: Material | undefined = undefined;
  private modelBuffer: GPUBuffer;

  public bindGroup?: GPUBindGroup;

  constructor(material? : Material) {
    super();
    this.modelBuffer = device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false, 
    });

    device.queue.writeBuffer(this.modelBuffer, 0, new Float32Array(16).buffer);
    this._material = material;
  }

  public setMaterial(material: Material) {
    this._material = material;
    this._material.meshes.push(this);
    this.scene.registerMaterial(this._material);

    // Required uniforms from the mesh
    this.bindGroup = device.createBindGroup({
      layout: this._material.meshBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.modelBuffer,
          },
        },
      ],
    })

  }

  public get material(): Material {
    if (!this._material) {
      console.error("ERR: Material not initialized");
    }

    return this._material!;
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
  
  
  public override awake(): void {
    super.awake();
    // Auto register material if provided
    if (this._material) {
      this.setMaterial(this._material);
    }
  }

  public override update(dt: number): void {
    if (this.modelBuffer) {
      // device.queue.writeBuffer(this.modelBuffer, 0, <ArrayBuffer>(this.transform.matrix!.toGlMatrix()));
      device.queue.writeBuffer(this.modelBuffer, 0, <ArrayBuffer>(this.transform.worldModelMatrix));
    }
    else {
      console.error("ERR: Model buffer not initialized");
    }
  }
}

export class QuadMesh extends Mesh  {

  constructor(material? : Material) {
    super(material);
    this.vertices = new Float32Array([
      // Poisitions     // UV
      -0.5, -0.5, 0.0, 0.0, 0.0, 0.5, -0.5, 0.0, 1.0, 0.0, -0.5, 0.5, 0.0, 0.0,
      1.0, 0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.5, 0.0, 1.0, 1.0, -0.5, 0.5, 0.0,
      0.0, 1.0,
    ]);

    this.vertexCount = 6;

    this.vertexBuffer = device.createBuffer({
      size: this.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Float32Array(this.vertexBuffer.getMappedRange()).set(this.vertices);
    this.vertexBuffer.unmap();
    
    device.queue.writeBuffer(
      this.vertexBuffer,
      0,
      this.vertices.buffer,
      0
    );
  }

}
