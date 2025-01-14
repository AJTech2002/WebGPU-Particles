import { device } from "@engine/engine";
import { Color } from "@math";
import { vec3 } from "gl-matrix";

export class Uniform<T> {
  public name: string;
  protected _value: T | undefined;

  protected f32Array: Float32Array | undefined;
  protected buffer: GPUBuffer | undefined;
  protected stagingBuffer: GPUBuffer | undefined;

  protected byteSize: number = 0;
  protected usage: GPUBufferUsageFlags = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;

  constructor(name: string, defaultValue: T) {
    this.name = name;
    this._value = defaultValue;
  }

  setup(autoWrite: boolean = true) {
    this.buffer = device.createBuffer({
      size: this.byteSize, // Byte size
      usage: this.usage,
      mappedAtCreation: false,
    });

    this.stagingBuffer = device.createBuffer({
      size: this.byteSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    
    if (autoWrite)
      this.updateBuffer();
  }

  public get gpuBuffer() {
    if (this.buffer === undefined) {
      console.error("Uniform buffer not initialized.");
    }

    return this.buffer!;
  }

  protected toFloat32Array(value: T): Float32Array {
    return new Float32Array([]);
  }

  protected fromF32Array(f32Array: Float32Array): T {
    return {} as T;
  }

  protected updateBuffer() {
    if (this.buffer === undefined) {
      console.error("Uniform buffer not initialized.");
    }

    if (this.f32Array === undefined) {
      this.f32Array = this.toFloat32Array(this._value!);
    }

    device.queue.writeBuffer(this.gpuBuffer, 0, this.f32Array.buffer);
  }

  public set value(value: T) {
    this._value = value;
    this.f32Array = this.toFloat32Array(this._value!);
    this.updateBuffer();
  }

  public get value(): T {
    return this._value!;
  }

  protected mapPending: boolean = false;

  public async read (from? : number, readLength?: number) : Promise<T | null> {
    if (this.mapPending) {
      return null;
    }

    if (this.buffer === undefined || this.stagingBuffer === undefined) {
      console.error("Uniform buffer not initialized.");
      return null;
    }

    this.mapPending = true;

    const commandEncoder = device.createCommandEncoder();

    commandEncoder.copyBufferToBuffer(
      this.buffer,      // Source buffer (the GPU buffer you're reading from)
      from ?? 0,              // Source offset
      this.stagingBuffer,  // Destination buffer (the staging buffer)
      from ?? 0,              // Destination offset
      readLength ?? this.byteSize      // Number of bytes to copy
    );

    // DEBUG: console.log("Reading buffer",from ?? 0 , readLength ?? this.byteSize);

    const commands = commandEncoder.finish();
    device.queue.submit([commands]);

    await device.queue.onSubmittedWorkDone();

    try {
      await this.stagingBuffer.mapAsync(GPUMapMode.READ);
    } catch (error) {
      //console.error("Failed to map staging buffer:", error);
      this.mapPending = false;
      return null;
    }

    const mappedRange = this.stagingBuffer.getMappedRange(from ?? 0, readLength ?? this.byteSize);
    const f32 = new Float32Array(mappedRange);
    const result = this.fromF32Array(f32);

    this.stagingBuffer.unmap();

    this.mapPending = false;


    return result;
  }

}

export class ArrayUniform<T> extends Uniform<T[]> {

  protected elementSize: number = 0;
  protected packedElementSize: number = 0;

  constructor(name: string, defaultValue: T[]) {
    super(name, defaultValue);
    this.usage = GPUBufferUsage.STORAGE |
    GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST ;
  }

  setup(autoWrite: boolean): void {
    super.setup(autoWrite);
    this.packedElementSize = this.elementSize / 4;
  }

  protected toFloat32Array(value: T[]): Float32Array {
    // create array of floats (to the maximum size)
    this.f32Array = new Float32Array(this.byteSize / 4);
    
    for (let i = 0; i < value.length; i++) {
       this.setArrayData(i, value[i]);
    }

    return this.f32Array;
  }

  protected fromF32Array(f32Array: Float32Array): T[] {
    const result: T[] = [];
    for (let i = 0; i < f32Array.byteLength / this.elementSize; i++) {
      const res = this.getArrayData(i, f32Array);
      if (res)
        result.push(res);
      else
        result.push({} as T); 
    } 
    return result;
  }

  protected setArrayData(index: number, data: T) {
    //
  }

  protected getArrayData(index: number, f32Array: Float32Array): T | null {
    return null;
  }

  public async readTo (index: number) {
    return await this.read(0, this.elementSize * index);
  }

  public async readElement (index: number) : Promise<T | null>{
    const elements = (await this.read(this.elementSize * index, this.elementSize));

    if (elements != null && elements[0] != null) {
      return elements[0]; 
    }

    return null;
  }

  public updateBufferAt(index: number, data: T) {
    if (this.buffer === undefined || this.f32Array === undefined) {
      console.error("Uniform buffer not initialized.");
      return;
    }
    
    if (index >= this.byteSize / this.elementSize) {
      console.error("Index out of bounds", index, this.byteSize / this.elementSize);
      return;
    }

    this.setArrayData(index, data);
    const dataOffset = index * this.elementSize; // Offset in bytes for the latest boid

    device.queue.writeBuffer(
      this.buffer,
      dataOffset, // Offset within the buffer

      this.f32Array.buffer,
      dataOffset, // Offset within the f32Array

      this.elementSize
    );
  }

  protected updateBuffer() {
    super.updateBuffer();
  }
}

export class ColorUniform extends Uniform<Color> {
  constructor(defaultValue: Color) {
    super("color", defaultValue);
    this.byteSize = 16;
  }

  protected toFloat32Array(value: Color): Float32Array {
    return new Float32Array([value.r, value.g, value.b, 1.0]);
  }

  protected updateBuffer(): void {
    super.updateBuffer();
  }
}

export class FloatUniform extends Uniform<number> {
  constructor(defaultValue: number) {
    super("float", defaultValue);
    this.byteSize = 4;
  }

  protected toFloat32Array(value: number): Float32Array {
    return new Float32Array([value]);
  }

  protected fromF32Array(f32Array: Float32Array): number {
    return f32Array[0];
  }

  protected updateBuffer(): void {
    super.updateBuffer();
  }
}

export class Vec3Uniform extends Uniform<vec3> {
  constructor(defaultValue: vec3) {
    super("vec3", defaultValue);
    this.byteSize = 12;
  }

  protected toFloat32Array(value: vec3): Float32Array {
    return new Float32Array(value);
  }

  protected fromF32Array(f32Array: Float32Array): vec3 {
    return vec3.fromValues(f32Array[0], f32Array[1], f32Array[2]);
  }

  protected updateBuffer(): void {
    super.updateBuffer();
  }
}
