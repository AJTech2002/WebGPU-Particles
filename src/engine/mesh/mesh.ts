import Engine, { device } from "@engine/engine";
import Material from "@engine/renderer/material";
import Scene from "@engine/scene";
import Component from "@engine/scene/component";
import { Renderer } from "@renderer/renderer";
import { mat4 } from "gl-matrix";

export default class Mesh extends Component {

  public name: string = "Mesh";

  // Must be created in a constructor
  protected vertexBuffer!: GPUBuffer;
  protected vertices!: Float32Array;
  protected vertexCount!: number;

  public transform: mat4;

  private material: Material | null = null;
  private modelBuffer: GPUBuffer;

  public bindGroup?: GPUBindGroup;

  constructor(scene: Scene) {
    super(scene);
    this.scene = scene;

    this.transform = mat4.identity(mat4.create());
    this.scene.meshes.push(this);

    this.modelBuffer = this.scene.renderer.device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false, 
    });

    device.queue.writeBuffer(this.modelBuffer, 0, new Float32Array(16).buffer);
  }

  public setMaterial(material: Material) {
    this.material = material;
    this.material.meshes.push(this);

    // Required uniforms from the mesh
    this.bindGroup = device.createBindGroup({
      layout: this.material.meshBindGroupLayout,
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

  public getVertexBuffer(): GPUBuffer {
    return this.vertexBuffer;
  }

  public getVertexCount(): number {
    return this.vertexCount;
  }

  public getVertices(): Float32Array {
    return this.vertices;
  }

  public preRender(): void {
    const device = this.scene.renderer.device;
    if (this.modelBuffer) {
      device.queue.writeBuffer(this.modelBuffer, 0, <ArrayBuffer>this.transform);
    }
    else {
      console.error("ERR: Model buffer not initialized");
    }
  }
}

export class QuadMesh extends Mesh  {

  constructor(name: string, scene: Scene) {
    super(scene);

    this.name = name;

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