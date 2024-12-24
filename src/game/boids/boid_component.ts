import { device } from "@engine/engine";
import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import matrixShader from "./shaders/matrix.wgsl";
import computeShaderCode from "./shaders/compute.wgsl";
import BoidMaterial from "./boid_material";
import { ArrayUniform, FloatUniform, Uniform } from "@engine/renderer/uniforms";
import {
  makeBindGroupLayoutDescriptors,
  makeShaderDataDefinitions,
  makeStructuredView,
  TypeDefinition,
} from "webgpu-utils";


interface BoidInitData {
  position: vec3;
  speed: number;
}

interface BoidData {
  target: vec4; // bytes: 16
  avoidance: vec4; // bytes: 16
  hasTarget: boolean; // bytes: 4
  speed: number; // bytes: 4
}

const boidComputeShader = matrixShader + " \n " + computeShaderCode;

class BoidDataBuffer extends ArrayUniform<BoidData> {
  constructor(maxInstanceCount: number) {
    super("boidData", []);

    this.usage = GPUBufferUsage.STORAGE |
    GPUBufferUsage.COPY_DST |
    GPUBufferUsage.COPY_SRC ;

    const defs = makeShaderDataDefinitions(boidComputeShader);
    const boidDataStorageDescriptor = defs.storages.boids;
    const boidDataElementType: TypeDefinition = (
      boidDataStorageDescriptor.typeDefinition as any
    ).elementType;

    this.elementSize = boidDataElementType.size;
    this.byteSize = maxInstanceCount * boidDataElementType.size;

    this._value = [];

    this.f32Array = this.toFloat32Array(this._value);
  }

  protected override setArrayData(index: number, data: BoidData) {
    const packedSize = this.byteSize / 4;

    if (!this.f32Array) {
      console.warn("Boid data not initialized");
      return;
    }


    this.f32Array[index * packedSize] = data.target[0];
    this.f32Array[index * packedSize + 1] = data.target[1];
    this.f32Array[index * packedSize + 2] = data.target[2];
    this.f32Array[index * packedSize + 3] = data.target[3];

    this.f32Array[index * packedSize + 4] = data.avoidance[0];
    this.f32Array[index * packedSize + 5] = data.avoidance[1];
    this.f32Array[index * packedSize + 6] = data.avoidance[2];
    this.f32Array[index * packedSize + 7] = data.avoidance[3];

    this.f32Array[index * packedSize + 8] = data.hasTarget ? 1 : 0;
    this.f32Array[index * packedSize + 9] = data.speed;
  }
}

class ObjectDataBuffer extends ArrayUniform<mat4> {
  constructor(maxInstanceCount: number) {
    super("boidData", []);

    this.usage = GPUBufferUsage.STORAGE |
    GPUBufferUsage.COPY_DST |
    GPUBufferUsage.COPY_SRC ;

    const defs = makeShaderDataDefinitions(boidComputeShader);
    const objectDataStorageDescriptor = defs.storages.objects;
    const elementType: TypeDefinition = (
      objectDataStorageDescriptor.typeDefinition as any
    ).elementType;

    this.elementSize = elementType.size;
    this.byteSize = maxInstanceCount * elementType.size;

    this._value = [];

    this.f32Array = this.toFloat32Array(this._value);
  }

  protected setArrayData(index: number, data: mat4): void {
    if (!this.f32Array) {
      console.warn("Boid data not initialized");
      return;
    }

    for (let j = 0; j < 16; j++) {
      this.f32Array[16 * index + j] = data[j];
    }

  }
}

// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {

  private boidData: BoidDataBuffer;
  public objectData: ObjectDataBuffer;
  private timeData: Uniform<number>;
  private deltaTimeData: Uniform<number>;

  private layout: GPUBindGroupLayout;
  private bindGroup: GPUBindGroup;

  public instanceCount: number = 0;
  public maxInstanceCount: number = 10000;

  // compute
  private avoidancePipeline!: GPUComputePipeline;
  private movementPipeline!: GPUComputePipeline;

  constructor() {
    super();

    this.boidData = new BoidDataBuffer(this.maxInstanceCount);
    this.objectData = new ObjectDataBuffer(this.maxInstanceCount);
    this.timeData = new FloatUniform(0);
    this.deltaTimeData = new FloatUniform(0);

    this.boidData.setup();
    this.objectData.setup();
    this.timeData.setup();
    this.deltaTimeData.setup();

    this.layout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        },
        {
          // time uniform
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" },
        },
        {
          // delta time uniform
          binding: 3,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" },
        },
      ],
    });

     this.bindGroup = device.createBindGroup({
       layout: this.layout,
       entries: [
        {
            binding: 0,
            resource: { buffer: this.objectData.gpuBuffer },
        },
        {
            binding: 1,
            resource: { buffer: this.boidData.gpuBuffer },
        },
        {
            binding: 2,
            resource: { buffer: this.timeData.gpuBuffer },
        },
        {
            binding: 3,
            resource: { buffer: this.deltaTimeData.gpuBuffer },
        },
       ],
     });

    this.avoidancePipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [this.layout],
      }),
      compute: {
        module: device.createShaderModule({
          code: boidComputeShader,
        }),
        entryPoint: "avoidanceMain",
      },
    });

    this.movementPipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [this.layout],
      }),
      compute: {
        module: device.createShaderModule({
          code: boidComputeShader,
        }),
        entryPoint: "movementMain",
      },
    });
  }

  private warned: boolean = false;
  public addBoid(init: BoidInitData): void {

    if (this.instanceCount >= this.maxInstanceCount) {
      if (!this.warned) {
        this.warned = true;
        console.warn("Max instance count reached");
      }
      return;
    }

    this.boidData.updateBufferAt(this.instanceCount, {
      target: [0, 0, init.position[2], 0],
      avoidance: vec4.create(),
      hasTarget: false,
      speed: init.speed,
    });

    const model = mat4.identity(mat4.create());
    mat4.translate(model, model, init.position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    this.objectData.updateBufferAt(this.instanceCount, model);
    this.instanceCount++;
  }

  public awake(): void {}

  public update(dT: number): void {
    if (this.bindGroup) {

      const sDT = dT / 1000;

      this.timeData.value = this.scene.sceneTime / 1000; 
      this.deltaTimeData.value = sDT;

      const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();

      // [ GPU Compute Work ]
      const computePass = commandEncoder.beginComputePass();

      computePass.setPipeline(this.avoidancePipeline);
      computePass.setBindGroup(0, this.bindGroup);

      computePass.dispatchWorkgroups(Math.ceil(this.instanceCount / 64));

      computePass.setPipeline(this.movementPipeline);
      computePass.setBindGroup(0, this.bindGroup);

      computePass.dispatchWorkgroups(Math.ceil(this.instanceCount / 64));

      computePass.end();
      device.queue.submit([commandEncoder.finish()]);

      if (this.gameObject.mesh?.material)
        (this.gameObject.mesh?.material as BoidMaterial).instanceCount =
          this.instanceCount;
    }
  }
}
