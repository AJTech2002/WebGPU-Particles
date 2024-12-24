import { device } from "@engine/engine";
import { Color } from "@math";

export class Uniform<T> {
  public name: string;
  protected _value: T | undefined;

  protected f32Array: Float32Array | undefined;
  protected buffer: GPUBuffer | undefined;

  protected byteSize: number = 0;
  protected usage: GPUBufferUsageFlags = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

  constructor(name: string, defaultValue: T) {
    this.name = name;
    this._value = defaultValue;
  }

  setup() {
    this.buffer = device.createBuffer({
      size: this.byteSize, // Byte size
      usage: this.usage,
      mappedAtCreation: false,
    });
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

}

export class ArrayUniform<T> extends Uniform<T[]> {

  protected elementSize: number = 0;

  constructor(name: string, defaultValue: T[]) {
    super(name, defaultValue);
    this.usage = GPUBufferUsage.STORAGE |
    GPUBufferUsage.COPY_DST |
    GPUBufferUsage.COPY_SRC ;
  }

  protected toFloat32Array(value: T[]): Float32Array {
    // create array of floats (to the maximum size)
    this.f32Array = new Float32Array(this.byteSize / 4);
    
    for (let i = 0; i < value.length; i++) {
       this.setArrayData(i, value[i]);
    }

    return this.f32Array;
  }

  protected setArrayData(index: number, data: T) {
    //
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
      dataOffset,
      this.f32Array.buffer,
      0,
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

  protected updateBuffer(): void {
    super.updateBuffer();
  }
}