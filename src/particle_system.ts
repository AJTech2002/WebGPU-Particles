import { mat4, vec3 } from "gl-matrix";
import Mesh from "./core/engine/mesh/mesh";
import InstancedMesh from "./core/engine/mesh/instanced_mesh";
import Pass from "./core/engine/pass";
import Scene from "./core/engine/scene";
import ParticleComputePass from "./pass/computepass";
import ParticleRenderPass from "./pass/renderpass";

export class QuadMesh extends InstancedMesh {
  object_data: Float32Array;
  instances: mat4[] = [];

  constructor(device: GPUDevice, renderPass: ParticleRenderPass, scene: Scene, computePass: ParticleComputePass) {
    super(device, renderPass, scene);

    // SQUARE VERTICES
    this.vertices = new Float32Array([
      -0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 0.5, -0.5, 0.0, 0.0, 1.0, 0.0, -0.5, 0.5,
      0.0, 0.0, 0.0, 1.0, 0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 0.5, 0.5, 0.0, 0.0,
      0.0, 1.0, -0.5, 0.5, 0.0, 1.0, 0.0, 0.0,
    ]);

    let triCount = 10000;

    this.object_data = new Float32Array(triCount * 10);
    this.instanceCount = 0;

    this.vertexCount = this.vertices.length / 6;

    const usage: GPUBufferUsageFlags =
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    //VERTEX: the buffer can be used as a vertex buffer
    //COPY_DST: data can be copied to the buffer

    const descriptor: GPUBufferDescriptor = {
      size: this.vertices.byteLength,
      usage: usage,
      mappedAtCreation: true, // similar to HOST_VISIBLE, allows buffer to be written by the CPU
    };

    this.vertexBuffer = device.createBuffer(descriptor);

    //Buffer has been created, now load in the vertices
    new Float32Array(this.vertexBuffer.getMappedRange()).set(this.vertices);
    this.vertexBuffer.unmap();

    var instanceCount = 0;
    for (var y: number = 0; y < triCount; y++) {
      let model = mat4.create();

      let randomX = Math.random() * 20 - 10;
      let randomY = Math.random() * 20 - 10;

      mat4.translate(model, model, [randomX, randomY, -10.0]);
      mat4.scale(model, model, [0.1, 0.1, 0.1]);

      this.instances.push(model);

      for (var j: number = 0; j < 16; j++) {
        this.object_data[16 * instanceCount + j] = <number>model.at(j);
      }

      instanceCount++;
    }

    this.instanceCount = instanceCount;

    this.objectBuffer = this.device.createBuffer({
      size: 64 * 10024,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });

    this.computeBindGroup = this.device.createBindGroup({
        layout: computePass.getBindGroupLayout(),
        entries: [
          {
            binding: 0,
            resource: { buffer: this.objectBuffer },
          },
        ],
      });

    // Write Vertex Buffer Data
    this.device.queue.writeBuffer(
      this.vertexBuffer,
      0,
      this.vertices.buffer,
      0
    );

    // Write instance data
    this.device.queue.writeBuffer(
      this.objectBuffer,
      0,
      this.object_data.buffer,
      0,
      this.object_data.length * 4
    );

    this.bindGroup = this.device.createBindGroup({
      layout: this.pass.getBindGroupLayout(),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: scene.getCamera().buffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.getObjectBuffer(),
          },
        },
      ],
    });
  }
}
