import { device, root } from "@engine/engine";
import Component from "@engine/scene/component";
import { mat4, vec3 } from "gl-matrix";
import tgpu, { TgpuBindGroup, TgpuBindGroupLayout, TgpuBuffer } from "typegpu";
import * as d from "typegpu/data";

import matrixShader from "./shaders/matrix.wgsl";
import computeShaderCode from "./shaders/compute.wgsl";
import BoidMaterial from "./boid_material";

const BoidData = d.struct({
  target: d.vec4f,
  avoidance: d.vec4f,
  hasTarget: d.bool,
  speed: d.f32,
});

type BoidType = typeof BoidData;
export type BoidObjectType = d.TgpuStruct<{
  model: d.TgpuArray<d.Mat4x4f>;
}>;

// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {
  private boidData: TgpuBuffer<d.TgpuArray<BoidType>>;
  public objectData: TgpuBuffer<BoidObjectType>;
  private timeData: TgpuBuffer<d.F32>;
  private deltaTimeData: TgpuBuffer<d.F32>;

  private layout: TgpuBindGroupLayout;
  private bindGroup: TgpuBindGroup;

  public instanceCount: number = 1;
  public maxInstanceCount: number = 1000;

  // compute
  private avoidancePipeline!: GPUComputePipeline;
  private movementPipeline!: GPUComputePipeline;

  private boids: any[] = [];
  private objects: any[] = [];

  constructor() {
    super();

   const boid = Array.from({ length: 1 }).map(() => ({
      target: d.vec4f(),
      avoidance: d.vec4f(),
      hasTarget: false,
      speed: 0,
    }));

   const identity = mat4.identity(mat4.create());
   const arr = identity.map((v) => v);
   console.log(arr);
   const obj = {
      model: [d.mat4x4f(...arr)]
   }

    const ObjectData: BoidObjectType = d.struct({
      model: d.arrayOf(d.mat4x4f, this.maxInstanceCount),
    });

    this.boidData = root.createBuffer(d.arrayOf(BoidData, this.maxInstanceCount), boid)
    .$usage('storage');

    this.objectData = root.createBuffer(ObjectData, obj)
    .$usage('storage');

    this.timeData = root.createBuffer(d.f32, 0)
    .$usage('uniform');
    
    this.deltaTimeData = root.createBuffer(d.f32, 0)
    .$usage('uniform');

    this.layout = tgpu.bindGroupLayout({
      objects: {
        storage: ObjectData,
        access: "mutable",
      },
      boids: {
        storage: BoidData,
        access: "mutable",
      },
      time: {
        uniform: d.f32,
      },
      dT: {
        uniform: d.f32,
      },
    });

    this.bindGroup = this.layout.populate({
      objects: root.unwrap(this.objectData),
      boids: root.unwrap(this.boidData),
      time: root.unwrap(this.timeData),
      dT: root.unwrap(this.deltaTimeData),
    });

    this.avoidancePipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [root.unwrap(this.layout)],
      }),
      compute: {
        module: device.createShaderModule({
          code: matrixShader + " \n " + computeShaderCode,
        }),
        entryPoint: "avoidanceMain",
      },
    });

    this.movementPipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [root.unwrap(this.layout)],
      }),
      compute: {
        module: device.createShaderModule({
          code: matrixShader + " \n " + computeShaderCode,
        }),
        entryPoint: "movementMain",
      },
    });
  }

  public awake(): void {}

  public update(dT: number): void {
    if (this.bindGroup) {
      const sDT = dT / 1000;
      const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();

      // [ GPU Compute Work ]
      const computePass = commandEncoder.beginComputePass();
      computePass.setPipeline(this.avoidancePipeline);
      computePass.setBindGroup(0, root.unwrap(this.bindGroup));
      computePass.dispatchWorkgroups(Math.ceil(this.instanceCount / 64));

      computePass.setPipeline(this.movementPipeline);
      computePass.setBindGroup(0, root.unwrap(this.bindGroup));
      computePass.dispatchWorkgroups(Math.ceil(this.instanceCount / 64));

      computePass.end();
      // device.queue.submit([commandEncoder.finish()]);

      if (this.gameObject.mesh?.material)
         (this.gameObject.mesh?.material as BoidMaterial).instanceCount = this.instanceCount;
    }
  }
}
