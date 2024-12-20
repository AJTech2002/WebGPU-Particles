import { mat4, vec3, vec4 } from "gl-matrix";
import Mesh from "./core/engine/mesh/mesh";
import InstancedMesh from "./core/engine/mesh/instanced_mesh";
import Pass from "./core/engine/pass";
import Scene from "./core/engine/scene";
import ParticleComputePass from "./pass/computepass";
import ParticleRenderPass from "./renderer/core/renderpass";
import { View } from "structurae";
import Texture from "./core/engine/texture";

interface BoidData {
  target: vec4; // bytes: 16
  avoidance: vec4; // bytes: 16
  hasTarget: boolean; // bytes: 4
  speed: number; // bytes: 4
}

const boidDataStructSize = 4 + 4 + 4; // Stored in number of floats because of the way the buffer is created

export class InstancedQuadMesh extends InstancedMesh {
  object_data: Float32Array | undefined;
  instances: mat4[] = [];

  boids: BoidData[] = [];
  boid_data: Float32Array | undefined;

  boidBuffer: GPUBuffer | undefined;

  timeUniform: GPUBuffer | undefined;
  deltaTimeUniform: GPUBuffer | undefined;

  private computePass: ParticleComputePass;

  constructor(
    device: GPUDevice,
    renderPass: ParticleRenderPass,
    scene: Scene,
    computePass: ParticleComputePass
  ) {
    super(device, renderPass, scene);
    this.computePass = computePass;
  }

  async init() {
    const scene = this.scene;

    const texture = new Texture();
    await texture.loadTexture(this.device, "dist/guy-2.png");
    console.log(texture);

    // SQUARE VERTICES
    this.vertices = new Float32Array([
      // Poisitions     // UV
      -0.5, -0.5, 0.0, 0.0, 0.0, 0.5, -0.5, 0.0, 1.0, 0.0, -0.5, 0.5, 0.0, 0.0,
      1.0, 0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.5, 0.0, 1.0, 1.0, -0.5, 0.5, 0.0,
      0.0, 1.0,
    ]);

    let numberOfParticles = 0;
    let maxNumberOfParticles = 10000;
    this.instanceCount = 0; // start at 0 and populate with instances
    this.object_data = new Float32Array(maxNumberOfParticles * 16); // Mat4 per particle
    this.boid_data = new Float32Array(maxNumberOfParticles * boidDataStructSize); // Vec4 Position per particle

    this.vertexCount = 6;

    const usage: GPUBufferUsageFlags =
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    //VERTEX: the buffer can be used as a vertex buffer
    //COPY_DST: data can be copied to the buffer

    const descriptor: GPUBufferDescriptor = {
      size: this.vertices.byteLength,
      usage: usage,
      mappedAtCreation: true, // similar to HOST_VISIBLE, allows buffer to be written by the CPU
    };

    this.vertexBuffer = this.device.createBuffer(descriptor);

    //Buffer has been created, now load in the vertices
    new Float32Array(this.vertexBuffer.getMappedRange()).set(this.vertices);
    this.vertexBuffer.unmap();

    var instanceCount = 0;
    
    this.instanceCount = instanceCount;

    this.objectBuffer = this.device.createBuffer({
      size: maxNumberOfParticles * 16 * 4,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC 
    });

    this.boidBuffer = this.device.createBuffer({
      size: maxNumberOfParticles * boidDataStructSize * 4,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });

    this.updateBoidBuffer();

    this.timeUniform = this.device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.deltaTimeUniform = this.device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.computeBindGroup = this.device.createBindGroup({
      layout: this.computePass.getBindGroupLayout(),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.objectBuffer },
        },
        {
          binding: 1,
          resource: { buffer: this.boidBuffer },
        },
        {
          binding: 2,
          resource: { buffer: this.timeUniform },
        },
        {
          binding: 3,
          resource: { buffer: this.deltaTimeUniform },
        },
      ],
    });

    this.device.queue.writeBuffer(
      this.timeUniform,
      0,
      new Float32Array([0]).buffer
    );

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
      this.object_data.buffer
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
        {
          binding: 2,
          resource: texture.view!,
        },
        {
          binding: 3,
          resource: texture.sampler!,
        },
      ],
    });
  }

  setBoidTarget( index: number, target: vec3) {
    if (index >= this.boids.length) {
      console.warn("Index out of bounds");
      return;
    }

    const boid = this.boids[index];
    vec4.set(boid.target, target[0], target[1], -10, 1);
    boid.hasTarget = true;

    this.setBoidData(index, boid);
  }

  setBoidData(index: number, data: BoidData) {
    const packedSize = boidDataStructSize;
    if (!this.boid_data) {
      console.warn("Boid data not initialized");
      return;
    }

    this.boid_data[index * packedSize] = data.target[0];
    this.boid_data[index * packedSize + 1] = data.target[1];
    this.boid_data[index * packedSize + 2] = data.target[2];
    this.boid_data[index * packedSize + 3] = data.target[3];

    this.boid_data[index * packedSize + 4] = data.avoidance[0];
    this.boid_data[index * packedSize + 5] = data.avoidance[1];
    this.boid_data[index * packedSize + 6] = data.avoidance[2];
    this.boid_data[index * packedSize + 7] = data.avoidance[3];

    this.boid_data[index * packedSize + 8] = data.hasTarget ? 1 : 0;
    this.boid_data[index * packedSize + 9] = data.speed;
  }

  private time: number = 0;

  getPosition(index: number) : vec3 {
      // get the matrix from the object data
      const offset = index * 16;
      const data = this.object_data!;
      const position = vec3.create();
      position[0] = data[offset + 12];
      position[1] = data[offset + 13];
      position[2] = data[offset + 14];

      return position;
  }

  addGuy(pos: vec3, speed: number) {
    //TODO FILL THIS
    if (!this.object_data || !this.boid_data) {
      console.warn("Instance data not initialized");
      return;
    }
    if (!this.object_data || !this.boid_data) {
      console.warn("Instance data not initialized");
      return;
    }
  
    const model = mat4.create();
  
    const x = pos[0];
    const y = pos[1];

    mat4.translate(model, model, [x, y, -10.0]);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);
  
    // Add to instances array
    this.instances.push(model);
  
    // Update `object_data`
    const instanceIndex = this.instanceCount;
    for (let j = 0; j < 16; j++) {
      this.object_data[16 * instanceIndex + j] = model[j];
    }
  
    // Initialize `BoidData`
    const boidData = {
      target: vec4.fromValues(0, 0, 0, 1),
      hasTarget: false,
      avoidance: vec4.fromValues(0, 0, 0, 0),
      speed: speed,
    };
  
    this.boids.push(boidData);
  
    // Update `boid_data`
    this.setBoidData(instanceIndex, boidData);
  
    // Increment instance count
    this.instanceCount++;
  
    // Write only the latest instance data to the GPU buffer
    const objectDataOffset = instanceIndex * 16 * 4; // Offset in bytes for the latest object
    const boidDataOffset = instanceIndex * boidDataStructSize * 4; // Offset in bytes for the latest boid
  
    this.device.queue.writeBuffer(
      this.objectBuffer,
      objectDataOffset,
      this.object_data.buffer,
      objectDataOffset,
      16 * 4 // Size in bytes for one mat4
    );
  
    this.device.queue.writeBuffer(
      this.boidBuffer!,
      boidDataOffset,
      this.boid_data.buffer,
      boidDataOffset,
      boidDataStructSize * 4 // Size in bytes for one BoidData
    );
  }

  updateBuffers() {
    if (
      !this.boidBuffer ||
      !this.boid_data ||
      !this.timeUniform ||
      !this.deltaTimeUniform
    ) {
      console.warn("Boid buffer not initialized");
      return;
    }

    const time = performance.now() / 1000;
    const deltaTime = time - this.time;
    this.time = time;

    this.device.queue.writeBuffer(
      this.timeUniform,
      0,
      new Float32Array([time]).buffer
    );
    this.device.queue.writeBuffer(
      this.deltaTimeUniform,
      0,
      new Float32Array([deltaTime]).buffer
    );
  }

  updateBoidBuffer() {
    if (
      !this.boidBuffer ||
      !this.boid_data ||
      !this.timeUniform ||
      !this.deltaTimeUniform
    ) {
      console.warn("Boid buffer not initialized");
      return;
    }
    this.device.queue.writeBuffer(
      this.boidBuffer,
      0,
      this.boid_data.buffer,
      0,
      this.boid_data.length * 4 // Times 4 because the buffer is in bytes
    );

   this.objectBuffer.mapAsync(GPUMapMode.READ).then(() => {
    const arrayBuffer = this.objectBuffer.getMappedRange();
    const resultArray = new Float32Array(arrayBuffer.slice(0));
    this.objectBuffer.unmap();

    console.log(resultArray); // Outputs the data read from the storage buffer
   })
    

  }
}
