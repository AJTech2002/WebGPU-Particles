import { mat4, vec3, vec4 } from "gl-matrix";
import Mesh from "./core/engine/mesh/mesh";
import InstancedMesh from "./core/engine/mesh/instanced_mesh";
import Pass from "./core/engine/pass";
import Scene from "./core/engine/scene";
import ParticleComputePass from "./pass/computepass";
import ParticleRenderPass from "./pass/renderpass";
import {View} from 'structurae';

interface BoidData {
  target: vec4;
  avoidance: vec4;
  hasTarget: boolean;
}

const boidDataStructSize = 4 + 4 + 4; // Number of floats in the struct * 4 = 48 bytes

export class InstancedQuadMesh extends InstancedMesh {
  object_data: Float32Array;
  instances: mat4[] = [];

  boids: BoidData[] = [];
  boid_data: Float32Array;

  boidBuffer: GPUBuffer;

  constructor(device: GPUDevice, renderPass: ParticleRenderPass, scene: Scene, computePass: ParticleComputePass) {
    super(device, renderPass, scene);

    const view = new View();

    // SQUARE VERTICES
    this.vertices = new Float32Array([
      -0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 0.5, -0.5, 0.0, 0.0, 1.0, 0.0, -0.5, 0.5,
      0.0, 0.0, 0.0, 1.0, 0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 0.5, 0.5, 0.0, 0.0,
      0.0, 1.0, -0.5, 0.5, 0.0, 1.0, 0.0, 0.0,
    ]);

    let numberOfParticles = 2000;
    this.instanceCount = 0; // start at 0 and populate with instances
    this.object_data = new Float32Array(numberOfParticles * 16); // Mat4 per particle
    this.boid_data = new Float32Array(numberOfParticles * boidDataStructSize); // Vec4 Position per particle

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
    for (var y: number = 0; y < numberOfParticles; y++) {
      let model = mat4.create();

      let randomX = Math.random() * 20 - 10;
      let randomY = Math.random() * 20 - 10;

      mat4.translate(model, model, [randomX, randomY, -10.0]);
      mat4.scale(model, model, [0.1, 0.1, 0.1]);

      this.instances.push(model);

      for (var j: number = 0; j < 16; j++) {
        this.object_data[16 * instanceCount + j] = <number>model.at(j);
      }

      this.setBoidData(instanceCount, { target: vec4.fromValues(0, 0, 0, 1), hasTarget: false, avoidance: vec4.fromValues(0, 0, 0, 0) });
      instanceCount++;
    }

    this.instanceCount = instanceCount;

    this.objectBuffer = this.device.createBuffer({
      size: instanceCount * 16 * 4,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });

    this.boidBuffer = this.device.createBuffer({
      size: instanceCount * boidDataStructSize * 4,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });

    this.updateBoidBuffer();

    this.computeBindGroup = this.device.createBindGroup({
        layout: computePass.getBindGroupLayout(),
        entries: [
          {
            binding: 0,
            resource: { buffer: this.objectBuffer },
          },
          {
            binding: 1,
            resource: {buffer: this.boidBuffer}
          }
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
  
  setBoidTarget(target: vec3, index: number) {
    for (var i = 0; i < this.instanceCount; i++) {
      this.setBoidData(i, { target: vec4.fromValues(target[0], target[1], target[2], 1.0), hasTarget: true, avoidance: vec4.fromValues(0, 0, 0, 0) });
    }
  }

  setBoidData(index: number, data: BoidData) {
    const packedSize = boidDataStructSize;
    this.boid_data[index * packedSize] = data.target[0];
    this.boid_data[index * packedSize + 1] = data.target[1];
    this.boid_data[index * packedSize + 2] = data.target[2];
    this.boid_data[index * packedSize + 3] = data.target[3];

    this.boid_data[index * packedSize + 4] = data.avoidance[0];
    this.boid_data[index * packedSize + 5] = data.avoidance[1];
    this.boid_data[index * packedSize + 6] = data.avoidance[2];
    this.boid_data[index * packedSize + 7] = data.avoidance[3];

    this.boid_data[index * packedSize + 8] = data.hasTarget ? 1 : 0;
  }

  updateBoidBuffer() {
    this.device.queue.writeBuffer(
      this.boidBuffer,
      0,
      this.boid_data.buffer,
      0,
      this.boid_data.length * 4
    );
  }

}
