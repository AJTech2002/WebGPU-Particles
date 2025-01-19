import { ArrayUniform, Uniform } from "@engine/renderer/uniforms";
import { DynamicUniform } from "./dynamic-uniform";
import { createBinding, createStruct } from "./datatypes";
import { device } from "@engine/engine";

export interface QuickBuffer<T> {
  
  name: string;
  uniform: boolean;
  buffer: Uniform<T> | DynamicUniform<T> | ArrayUniform<T>;

} 

export class QuickCompute {

  // Shader
  private shader: string;
  private entry: string;
  private buffers: QuickBuffer<any>[];

  // GPU
  private bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [];
  private bindGroupEntries: GPUBindGroupEntry[] = [];
  private layout! : GPUBindGroupLayout;
  private bindGroup! : GPUBindGroup;
  private computePipeline! : GPUComputePipeline;
  private shaderModule! : GPUShaderModule;


  constructor (
    shader: string,
    entry: string,
    buffers: QuickBuffer<any>[]
  ) {
    this.shader = shader;
    this.entry = entry; 
    this.buffers = buffers;

    this.addBuffers();
    this.setup();
  }

  private addBuffers() {
    // from this
    let bindingIndex = 0;
    let groupIndex = 0;
    let bindings = "";
    let structs = "";

    for (let i = 0; i < this.buffers.length; i++) {

      // Reverse create BufferSchemaDescriptor
      const buffer = this.buffers[i];
      
      buffer.buffer.setup(true);

      const bufferSchema = buffer.buffer.schemaLayoutDescriptor;
      bufferSchema.name = buffer.name;

      if (typeof bufferSchema.type !== "string") {
        structs += createStruct(bufferSchema.type);
      }

      bindings += createBinding(bindingIndex, groupIndex, bufferSchema) + "\n";

      this.bindGroupLayoutEntries.push({
        binding: bindingIndex,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: bufferSchema.uniform ? "uniform" : "storage"
        }
      });

      this.bindGroupEntries.push({
        binding: bindingIndex,
        resource: { buffer: buffer.buffer.gpuBuffer }
      });

      bindingIndex++;
    }

    this.shader = structs + bindings + this.shader;
  }

  addComputePipeline(shader: string | GPUShaderModule, entryPoint: string) : GPUComputePipeline {

    let shaderModule : GPUShaderModule;

    if (shader instanceof GPUShaderModule) {
      shaderModule = shader;
    }
    else {
      shaderModule = device.createShaderModule({
        code: shader,
      });
    }

    const computePipeline = device.createComputePipeline({
      compute: {
        module: shaderModule,
        entryPoint: entryPoint,
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [this.layout],
      }),
    });

    return computePipeline;

  }

  public dispatch(workgroups: GPUIndex32) {
    const commandEncoder = device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();

    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.bindGroup);
    computePass.dispatchWorkgroups(workgroups);
    computePass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  private setup() {
    this.layout = device.createBindGroupLayout({
      entries: this.bindGroupLayoutEntries,
    });

    this.bindGroup = device.createBindGroup({
      layout: this.layout,
      entries: this.bindGroupEntries
    });

    this.shaderModule = device.createShaderModule({
      code: this.shader,
    });

    this.computePipeline = this.addComputePipeline(this.shaderModule, this.entry);
  }
}

