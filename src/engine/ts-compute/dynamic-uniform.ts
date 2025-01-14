import { mat4, vec3, vec4, vec2 } from "gl-matrix";
import { ArrayUniform } from "@engine/renderer/uniforms";
import { BufferSchema } from "./compute";
import { ShaderDataType, ShaderTypes} from "./datatypes";
import { getPrimitiveByteSize, getPrimitiveAlignment, parsePrimitives, parseFromPrimitives } from "./parsers";
import { device } from "@engine/engine";
/*
  * DynamicUniform is a subclass of ArrayUniform that allows for dynamic resizing of the buffer
  * based on the number of instances.
*/
export class DynamicUniform<T> extends ArrayUniform<T> {

  private maxInstanceCount: number = 1;
  private layout: ShaderDataType[] = [];
  private alignmentBytes: number = 0;
  private mappedLayoutByKey: Map<string, {
    type: ShaderDataType,
    offset: number,
  }> = new Map();
  private schema: BufferSchema<T>;
  private isArrayed: boolean = false;

  private writeStagingBuffer : GPUBuffer;

  constructor(name: string,  schema: BufferSchema<T>) {

    const defaultValue =  schema.defaultValue ? 
                            Array.isArray(schema.defaultValue) ? 
                              schema.defaultValue : [schema.defaultValue] : [];
    
    super(name, defaultValue);

    this.writeStagingBuffer = device.createBuffer({
      size: this.byteSize,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE,
      mappedAtCreation: true
    });
    
    this.isArrayed = schema.array;
    this.schema = schema;

    if (schema.uniform) {
      this.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;  
    }
    else {
      this.usage = GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST ;
    }

    let maxVarSize = 0;
    let rawElementSize = 0;
    for (const type of schema.layout) {
      rawElementSize += getPrimitiveByteSize(type);
      maxVarSize = Math.max(maxVarSize, getPrimitiveAlignment(type));
    }

    this.alignmentBytes = maxVarSize;
    // round the elementSize to the nearest multiple of maxVarSize for alignment
    this.elementSize = Math.ceil(rawElementSize / maxVarSize) * maxVarSize;

    this.layout = schema.layout;

    let offset = 0;
    for (const layout of this.layout) {
      if (layout.key) {
        this.mappedLayoutByKey.set(layout.key, {
          type: layout,
          offset: offset
        });
      }

      offset += getPrimitiveByteSize(layout);
    }

    // console.log("Layout", this.layout, this.mappedLayoutByKey);

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

      let v = data;

      if (this.layout[i].key) {
        v = (data as any)[this.layout[i].key!];
      }

      const primitiveData = parsePrimitives(v, this.layout[i]);
      this.f32Array.set(primitiveData, offset);
      offset += getPrimitiveByteSize(this.layout[i]) / 4; // Divide by 4 to get the number of floats
    }

  }

  public setValue (value: T) {
    this.updateBufferAt(0, value);
  }

  public setElement (index: number, value: T) {
    // this.setArrayData(index, value as T);
    this.updateBufferAt(index, value);
  }

  public upload() {
    if (this.buffer === undefined || this.f32Array === undefined) {
      console.error("Uniform buffer not initialized.");
      return;
    }

    device.queue.writeBuffer(
      this.buffer,
      0, // Offset within the bufferLayout
      this.f32Array.buffer
    );
  }

  public setElementPartial (index: number, value: Partial<T>) {

    if (index < 0 || index >= this.maxInstanceCount) {
      console.warn("Index out of bounds", index, this.maxInstanceCount);
      return;
    }

    // find the keys inside the partial 
    //debugger;
    const keys = Object.getOwnPropertyNames(value);

    for (const key of keys) {
      // get the offset of the key within the struct 
      const layout = this.mappedLayoutByKey.get(key);
      if (layout) {
        const offset = layout.offset;
        const type = layout.type;

        this.setArrayDataExact(index, offset, type, (value as any)[key]);
      }
    }

  }

  private setArrayDataExact (index: number, byteOffset: number, data: ShaderDataType, value: any) {
    if (!this.f32Array  || !this.buffer)  {
      console.error("Uniform buffer not initialized!");
      return;
    }

    const packedSize = this.packedElementSize;
    let offset = index * packedSize + (byteOffset / 4);
    let bOffset = (index * this.elementSize) + byteOffset;

    if (offset >= this.f32Array.length) {
      console.warn("Index out of bounds");
      return;
    }

    if (offset < 0) {
      console.warn("Negative offset");
      return;
    }

    const primitiveData = parsePrimitives(value, data);

    try {
      this.f32Array.set(primitiveData, offset);
    }
    catch (e) {
      console.log({primitiveData, offset, bOffset, f32Length: this.f32Array.length, f32: this.f32Array});
      console.error("Error setting data", e);
    }

    device.queue.writeBuffer(
      this.buffer,
      bOffset, // Offset within the bufferLayout

      this.f32Array.buffer,
      bOffset,

      primitiveData.byteLength
    );
  }

  protected getArrayData(index: number, f32Array: Float32Array): T | null {
    if (!this.f32Array) {
      console.warn("Boid data not initialized");
      return null;
    }
  
    const packedSize = this.packedElementSize;
    let offset = index * packedSize;
    if (offset >= this.f32Array.length) {
      console.warn("Index out of bounds");
      return null;
    }
    
    const isPrimitive = this.schema.structured === false;
    
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
