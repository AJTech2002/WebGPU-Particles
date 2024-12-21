import Engine, { device } from "@engine/engine";
import Material from "@engine/renderer/material";
import Scene from "@engine/scene";
import { Renderer } from "@renderer/renderer";
import { mat4 } from "gl-matrix";

export default class Mesh {

  public name: string = "Mesh";

  // Must be created in a constructor
  protected vertexBuffer!: GPUBuffer;
  protected vertices!: Float32Array;
  protected vertexCount!: number;
  public transform: mat4;

  private material: Material | null = null;
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;

    this.transform = mat4.identity(mat4.create());
    this.scene.meshes.push(this);
  }

  public setMaterial(material: Material) {
    this.material = material;
    this.material.meshes.push(this);
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