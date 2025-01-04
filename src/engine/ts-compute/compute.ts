/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import "reflect-metadata";
import { ShaderDataType, ShaderTypes } from "./datatypes";
import { ArrayUniform } from "@engine/renderer/uniforms";
import { mat4, vec3, vec4 } from "gl-matrix";

export interface BufferSchema<T> {
  name: string;
  constructorName: string | null;
  uniform: boolean;
  array: boolean;
  maxInstanceCount: number;
  defaultValue?: T | T[];
  layout: ShaderDataType[];
  type: (new() => T) | keyof typeof ShaderTypes;
}

export interface BufferSchemaDescriptor<T> {
  name: string;
  uniform: boolean;
  isArray: boolean;
  maxInstanceCount?: number;
  type: (new() => T) | keyof typeof ShaderTypes;
  defaultValue?: T | T[];
}

function parseFromPrimitives(data: Float32Array, type: ShaderDataType): unknown {
  switch (type.type) {
    case "mat4": {
      if (data.length !== 16) {
        throw new Error(`Invalid data length for mat4. Expected 16, got ${data.length}`);
      }
      const mat4: mat4 = Array.from(data) as mat4;
      return mat4;
    }
    case "vec4": {
      if (data.length !== 4) {
        throw new Error(`Invalid data length for vec4. Expected 4, got ${data.length}`);
      }
      const vec4: vec4 = Array.from(data) as vec4;
      return vec4;
    }
    case "vec3": {
      if (data.length !== 3) {
        throw new Error(`Invalid data length for vec3. Expected 3, got ${data.length}`);
      }
      const vec3: vec3 = Array.from(data) as vec3;
      return vec3;
    }
    case "bool": {
      if (data.length !== 1) {
        throw new Error(`Invalid data length for bool. Expected 1, got ${data.length}`);
      }
      return data[0] !== 0; // Convert back to boolean
    }
    default: {
      if (data.length !== 1) {
        throw new Error(`Invalid data length for scalar. Expected 1, got ${data.length}`);
      }
      return data[0]; // Return scalar directly
    }
  }
}

function parsePrimitives (data: unknown, type: ShaderDataType) : Float32Array {
  switch (type.type) {
    case "mat4": {
      const mat4 = data as mat4;
      const mat4_f32 = new Float32Array(16);

      for (let i = 0; i < 16; i++) {
        mat4_f32[i] = mat4[i];
      }

      return mat4_f32;
    }
    case "vec4": {
      const vec4 = data as vec4;
      return new Float32Array(vec4);
    }
    case "vec3": {
      const vec3 = data as vec3;
      return new Float32Array(vec3);
    }
    case "bool": {
      const bool = data as boolean;
      return new Float32Array([bool ? 1 : 0]);
    }
    default:
    {
      const f32 = data as number;
      return new Float32Array([f32]);
    }
      
  }
}

function getPrimitiveByteSize (type: ShaderDataType) : number {
  switch (type.type) {
    case "mat4": return 64;
    case "vec4": return 16;
    case "vec3": return 12;
    case "bool": return 4;
    default: return 4;
  }
}

/*
  * DynamicUniform is a subclass of ArrayUniform that allows for dynamic resizing of the buffer
  * based on the number of instances.
*/
export class DynamicUniform<T> extends ArrayUniform<T> {

  private maxInstanceCount: number = 1;
  private layout: ShaderDataType[] = [];
  private schema: BufferSchema<T>;
  private isArrayed: boolean = false;

  constructor(name: string,  schema: BufferSchema<T>) {

    const defaultValue =  schema.defaultValue ? 
                            Array.isArray(schema.defaultValue) ? 
                              schema.defaultValue : [schema.defaultValue] : [];
    
    super(name, defaultValue);

    this.isArrayed = schema.array;
    this.schema = schema;

    this.usage = GPUBufferUsage.STORAGE |
    GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST ;

    let maxVarSize = 0;
    let rawElementSize = 0;
    for (const type of schema.layout) {
      rawElementSize += getPrimitiveByteSize(type);
      maxVarSize = Math.max(maxVarSize, getPrimitiveByteSize(type));
    }

    // round the elementSize to the nearest multiple of maxVarSize for alignment
    this.elementSize = Math.ceil(rawElementSize / maxVarSize) * maxVarSize;

    this.layout = schema.layout;

    if (schema.array) {
      this.maxInstanceCount = schema.maxInstanceCount!;
    }
    else {
      this.maxInstanceCount = 1;
    }

    this.byteSize = this.elementSize * this.maxInstanceCount;
    this._value = [];
    this.f32Array = this.toFloat32Array(this._value);
  }

  protected setArrayData(index: number, data: T): void {
    if (!this.f32Array) {
      console.warn("Boid data not initialized");
      return;
    }

    const packedSize = this.packedElementSize;
    let offset = index * packedSize;

    if (offset >= this.f32Array.length) {
      console.warn("Index out of bounds");
      return;
    }
    
    for (let i = 0; i < this.layout.length; i++) {
      this.f32Array.set(parsePrimitives(data, this.layout[i]), offset);
      offset += getPrimitiveByteSize(this.layout[i]) / 4; // Divide by 4 to get the number of floats
    }

  }

  public setValue (value: T) {
    this.updateBufferAt(0, value);
  }

  public setElement (index: number, value: T) {
    this.updateBufferAt(index, value);
  }

  protected getArrayData(index: number, f32Array: Float32Array): T | null {
    if (!this.f32Array) {
      console.warn("Boid data not initialized");
      return null;
    }
  
    const packedSize = this.packedElementSize;
    let offset = index * packedSize;
    console.log("Offset",index, offset, f32Array.length);
    if (offset >= this.f32Array.length) {
      console.warn("Index out of bounds");
      return null;
    }
    
    const isPrimitive = typeof this.schema.type === "string";
    
    let result!: T;
    if (!isPrimitive) {
      result = new (this.schema.type as new() => T)();
    }
    

    for (let i = 0; i < this.layout.length; i++) {
      const sizeInBytes = getPrimitiveByteSize(this.layout[i]);
      const sizeInFloats = sizeInBytes / 4; // Convert bytes to float count
  
      const primitiveData = f32Array.slice(offset, offset + sizeInFloats);
  
      const key = this.layout[i].key; // Assuming `layout` includes the property key
      if (key && !isPrimitive) {
        (result as any)[key] = parseFromPrimitives(primitiveData, this.layout[i]);
      }
      else {
        result = parseFromPrimitives(primitiveData, this.layout[i]) as T;
      }
  
      offset += sizeInFloats;
    }
  
    return result as T;
  }

  protected updateBuffer(): void {
    super.updateBuffer();
  }

}

export default class Compute {

  private bufferSchemas: BufferSchema<any>[] = [];
  private buffers: DynamicUniform<any>[] = [];
  private mappedBuffers: Map<string, DynamicUniform<any>> = new Map();

  addBuffer<T extends Object>(descriptor: BufferSchemaDescriptor<T>) {

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
      constructorName = instance.constructor.name;
      const props = Object.getOwnPropertyNames(instance);

      for (const prop of props) {
        const type = Reflect.getMetadata("type", instance, prop);
        if (type) {
          bufferLayout.push(type);
        }
      }

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
      maxInstanceCount: descriptor.maxInstanceCount || 1
    }

    this.bufferSchemas.push(buffer);
  }

  init() {
    for (const buffer of this.bufferSchemas) {
        const uniform = new DynamicUniform(buffer.name, buffer);
        console.log("Setting up dynamic uniform", buffer.name, uniform);
        uniform.setup(!buffer.array)
        this.buffers.push(uniform);
        this.mappedBuffers.set(buffer.name, uniform);
    }
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

  get<T> (name: string): Promise<T | null> {
    const buffer : DynamicUniform<T> | null = this.getBuffer(name);
    if (buffer) {
      return buffer.readElement(0);
    }

    return Promise.resolve(null);
  }

}
