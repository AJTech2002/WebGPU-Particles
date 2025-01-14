/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import "reflect-metadata";
import { createBinding, createStruct, ShaderDataType, ShaderTypes, StorageMode } from "./datatypes";
import { DynamicUniform } from "./dynamic-uniform";
import { mat4, vec3, vec4 } from "gl-matrix";
import { device } from "@engine/engine";

import matrixShader from "../renderer/shaders/matrix.wgsl";
import randomNumberGenerator from "../renderer/shaders/random.wgsl";

export interface BufferSchema<T> {
  name: string;
  constructorName: string | null;
  uniform: boolean;
  array: boolean;
  maxInstanceCount: number;
  defaultValue?: T | T[];
  layout: ShaderDataType[];
  type: (new() => T) | keyof typeof ShaderTypes;
  structured: boolean;
}

export interface BufferSchemaDescriptor<T> {
  name: string;
  uniform: boolean;
  isArray: boolean;
  maxInstanceCount?: number;
  type: (new() => T) | keyof typeof ShaderTypes;
  storageMode: StorageMode;
  defaultValue?: T | T[];
}



export default class Compute {

  private bufferSchemas: BufferSchema<any>[] = [];
  private buffers: DynamicUniform<any>[] = [];
  private mappedBuffers: Map<string, DynamicUniform<any>> = new Map();

  private layout!: GPUBindGroupLayout;
  private bindGroup!: GPUBindGroup;
  private shader!: string;

  private entryPoints: string[] = [];
  private computePipelines: GPUComputePipeline[] = [];

  private structCode = "";
  private bindingCode = "";

  public ready: boolean = false;

  constructor(shader: string[], pipelines: string[]) {

    const totalShader = shader.join("\n");
    const constructedShader = randomNumberGenerator + " \n " + matrixShader + " \n " + totalShader;

    this.shader = constructedShader;
    this.entryPoints = pipelines;
  }

  private addBuffers() {
    // from this
    let bindingIndex = 0;
    let groupIndex = 0;

    for (const prop of Object.getOwnPropertyNames(this)) {
      const buffer = Reflect.getMetadata("buffer", this, prop);
      if (buffer) {
        this.addBuffer(buffer);
        this.bindingCode += createBinding(bindingIndex, groupIndex, buffer);
        bindingIndex++;
      }
    }
  }

  private addBuffer<T extends Object>(descriptor: BufferSchemaDescriptor<T>) {

    let constructorName = null;
    const bufferLayout : ShaderDataType[] = [];

    if (typeof descriptor.type === "string") {
      const type = ShaderTypes[descriptor.type as keyof typeof ShaderTypes];

      bufferLayout.push({
        type: type
      });

      if (!type) {
        throw new Error("Invalid shader type");
      }
    }
    else {

      const instance = new descriptor.type();
      const props = Object.getOwnPropertyNames(instance);
      constructorName = Reflect.getMetadata("structName", descriptor.type); 
      
      for (const prop of props) {
        const type = Reflect.getMetadata("type", instance, prop);
        if (type) {
          bufferLayout.push(type);
        }
      }

      this.structCode += createStruct(descriptor.type) + "\n";

    }

    if (descriptor.isArray && descriptor.maxInstanceCount === undefined) {
      throw new Error("Array buffer must have a max instance count");
    }

    const buffer: BufferSchema<T> = {
      name: descriptor.name,
      uniform: descriptor.uniform,
      constructorName: constructorName,
      array: descriptor.isArray,
      layout: bufferLayout,
      type: descriptor.type,
      defaultValue: descriptor.defaultValue,
      maxInstanceCount: descriptor.maxInstanceCount || 1,
      structured: typeof descriptor.type !== "string"
    }

    this.bufferSchemas.push(buffer);

  }

  init() {

    this.addBuffers();

    


    const bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [];
    const bindGroupEntries : GPUBindGroupEntry[] = [];

    for (let i = 0; i < this.bufferSchemas.length; i++) {
        const buffer = this.bufferSchemas[i];

        const uniform = new DynamicUniform(buffer.name, buffer);
        // console.log("Setting up dynamic uniform", buffer.name, uniform);

        uniform.setup(!buffer.array);

        this.buffers.push(uniform);
        this.mappedBuffers.set(buffer.name, uniform);
        
        bindGroupLayoutEntries.push({
          binding: i,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: buffer.uniform ? "uniform" : "storage" },
        });
        
        bindGroupEntries.push({
          binding: i,
          resource: { buffer: uniform.gpuBuffer },
        })
    }

    this.shader = this.bindingCode + this.structCode + this.shader; // Append the struct code to the shader

    this.layout = device.createBindGroupLayout({
      entries: bindGroupLayoutEntries,
    });

    this.bindGroup = device.createBindGroup({
      layout: this.layout,
      entries: bindGroupEntries
    });

    const shaderModule = device.createShaderModule({
      code: this.shader,
    });

    for (const entry of this.entryPoints) {
      const computePipeline = device.createComputePipeline({
        compute: {
          module: shaderModule,
          entryPoint: entry,
        },
        layout: device.createPipelineLayout({
          bindGroupLayouts: [this.layout],
        }),
      });

      this.computePipelines.push(computePipeline);
    }

    this.ready = true;
  }

  getBuffer<T>(name: string): DynamicUniform<T> | null {
    for (const buffer of this.buffers) {
      if (buffer.name === name) {
        return buffer as DynamicUniform<T>;
      }
    }

    return null;
  }
  
  set<T> (name: string, value: T) {
    const buffer = this.getBuffer(name);
    if (buffer) {
      buffer.setValue(value);
    }
  }

  setElement<T> (name: string, index: number, value: T) {
    const buffer = this.getBuffer(name);
    if (buffer) {
      buffer.setElement(index, value);
    }
  }

  setPartialElement<T> (name: string, index: number, value: Partial<T>) {
    const buffer = this.getBuffer(name);
    if (buffer) {
      buffer.setElementPartial(index, value);
    }
  }

  get<T> (name: string): Promise<T | null> {
    const buffer : DynamicUniform<T> | null = this.getBuffer(name);
    if (buffer) {
      return buffer.readElement(0);
    }

    return Promise.resolve(null);
  }

  dispatch(workgroups: GPUIndex32) {

    const commandEncoder = device.createCommandEncoder();

    for (let i = 0; i < this.computePipelines.length; i++) {

      const computePass = commandEncoder.beginComputePass();
      computePass.setPipeline(this.computePipelines[i]);
      computePass.setBindGroup(0, this.bindGroup);
      computePass.dispatchWorkgroups(workgroups);
      computePass.end();
    }

    device.queue.submit([commandEncoder.finish()]);
  }
}
