import { device } from "@engine/engine";
import { Color } from "@math";

class Uniform<T> {
  public name: string;
  private _value: T | undefined;

  private f32Array: Float32Array | undefined;
  private buffer: GPUBuffer | undefined;

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

    this.f32Array = this.toFloat32Array(this._value!);
    device.queue.writeBuffer(this.gpuBuffer, 0, this.f32Array.buffer);

  }

  public set value(value: T) {
    this._value = value;
    console.log("Setting value", value);
    this.updateBuffer();
  }

  public get value(): T {
    return this._value!;
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