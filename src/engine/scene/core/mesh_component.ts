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
  private _materials: Material[] = [];

  private modelBuffer: GPUBuffer;

  public bindGroup?: GPUBindGroup;

  public manualUpdate: boolean = false;

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

  public addMaterial(material: Material) {
    this._material = material;
    this._materials.push(material);
    this._material.meshes.push(this);
    this.scene.registerMaterial(this._material);

    // Required uniforms from the mesh
    // Assuming all materials have the same bind gruop
    if (this.bindGroup === undefined)
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

  public getMaterial<T extends Material>(type: new (...args: any[]) => T) {
    for (let i = 0; i < this._materials.length; i++) {
      if (this._materials[i] instanceof type) {
        return this._materials[i] as T;
      }
    }
    return null;
  }

  public removeMaterial <T extends Material>(type: new (...args: any[]) => T) {
    for (let i = 0; i < this._materials.length; i++) {
      if (this._materials[i] instanceof type) {
        return this._materials[i].removeMesh(this);
      }
    }
    return null;
  }

  private _needsUpdate: boolean = false;

  public set needsUpdate(value: boolean) {
    this._needsUpdate = value;
  }

  public get needsUpdate(): boolean {
    return !this.manualUpdate || this._needsUpdate;
  }

  public onPreDraw() {
    //
  }

  public onPostDraw() {
    if (this.manualUpdate) {
      this._needsUpdate = false;
    }
  }

  public get mainMaterial(): Material {
    if (!this._materials[0]) {
      console.error("ERR: Material not initialized");
    }

    return this._materials[0]!;
  }

  public get materials(): Material[] {
    return [...this._materials];
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
      this.addMaterial(this._material);
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
