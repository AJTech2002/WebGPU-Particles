import { device } from "@engine/engine";
import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import matrixShader from "./shaders/matrix.wgsl";
import computeShaderCode from "./shaders/compute.wgsl";
import BoidMaterial from "./boid_material";
import { ArrayUniform, FloatUniform, Uniform } from "@engine/renderer/uniforms";
import {
  makeShaderDataDefinitions,
  TypeDefinition,
} from "webgpu-utils";
import { BoidDataBuffer, ObjectDataBuffer } from "./boid_buffers";
import {Boid} from "./boid";


interface BoidInitData {
  position: vec3;
  speed: number;
}

export interface BoidData {
  target: vec4; // bytes: 16
  avoidance: vec4; // bytes: 16
  hasTarget: boolean; // bytes: 4
  speed: number; // bytes: 4
}

export interface BoidObjectData {
  model: mat4;
  position: vec3;
}

export const boidComputeShader = matrixShader + " \n " + computeShaderCode;

// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {

  private boidData: BoidDataBuffer;
  public objectData: ObjectDataBuffer;
  private timeData: FloatUniform;
  private deltaTimeData: FloatUniform;
  private numBoids: FloatUniform;

  private layout: GPUBindGroupLayout;
  private bindGroup: GPUBindGroup;

  public instanceCount: number = 0;
  public maxInstanceCount: number = 3000;

  // compute
  private avoidancePipeline!: GPUComputePipeline;
  private movementPipeline!: GPUComputePipeline;

  public boids: BoidData[] = [];
  public boidObjects: BoidObjectData[] = [];
  public boidRefs: Boid[] = [];
  
  constructor() {
    super();

    this.boidData = new BoidDataBuffer(this.maxInstanceCount);
    this.objectData = new ObjectDataBuffer(this.maxInstanceCount);
    this.timeData = new FloatUniform(0);
    this.deltaTimeData = new FloatUniform(0);
    this.numBoids = new FloatUniform(0);

    this.boidData.setup(false);
    this.objectData.setup(false);
    this.timeData.setup();
    this.deltaTimeData.setup();
    this.numBoids.setup();

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
        {
          binding: 4,
          visibility: GPUShaderStage.COMPUTE  ,
          buffer: {type: "uniform"}
        }
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
        {
          binding: 4,
          resource: {buffer: this.numBoids.gpuBuffer}
        }
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

  public async updateBoidInformation () : Promise<void> {
    const boidInfo = await this.boidData.readTo(this.instanceCount);
    if (boidInfo != null) this.boids = boidInfo;

    const objectInfo = await this.objectData.readTo(this.instanceCount);
    if (objectInfo != null) this.boidObjects = objectInfo;
  }

  private warned: boolean = false;
  public addBoid(init: BoidInitData): Boid | undefined{

    if (this.instanceCount >= this.maxInstanceCount) {
      if (!this.warned) {
        this.warned = true;
        console.warn("Max instance count reached");
      }
      return;
    }

    this.boidData.updateBufferAt(this.instanceCount, {
      target: [init.position[0], init.position[1], init.position[2], 0],
      avoidance: vec4.create(),
      hasTarget: true,
      speed: init.speed,
    });

    const model = mat4.identity(mat4.create());
    mat4.translate(model, model, init.position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    const position = vec3.clone(init.position);

    this.objectData.updateBufferAt(this.instanceCount, {
      model,
      position,
    });

    let boid = new Boid(
      this,
      this.instanceCount,
      init.position,
    )

    this.boidRefs.push(boid);

    this.instanceCount++;
    this.numBoids.value = this.instanceCount;

    return boid;
  }

  public setBoidPosition(index: number, position: vec3): void {
    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    const model = mat4.create();
    mat4.translate(model, model, position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    this.objectData.updateBufferAt(index, {
      model,
      position,
    });
  }

  public setBoidTarget(index: number, target: vec3): void {
    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    this.boidData.updateBufferAt(index, {
      target: [target[0], target[1], target[2], 0],
      avoidance: vec4.create(),
      hasTarget: true,
      speed: 1,
    });
  }

  public awake(): void {}

  public update(dT: number): void {
    if (this.bindGroup) {

      const sDT = dT / 1000;

      this.timeData.value = this.scene.sceneTime / 1000; 
      this.deltaTimeData.value = sDT * 3;
      this.numBoids.value = this.instanceCount;

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

      // [ ~~ Update Boid Information ~~ ]
      this.updateBoidInformation(); 

      if (this.gameObject.mesh?.material)
        (this.gameObject.mesh?.material as BoidMaterial).instanceCount =
          this.instanceCount;
    }
  }
}
