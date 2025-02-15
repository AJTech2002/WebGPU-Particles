import { BufferSchemaDescriptor } from "../ts-compute/compute";
import { Color } from "../math/src/index.js";
import { vec3 } from "gl-matrix";
export declare class Uniform<T> {
    name: string;
    protected _value: T | undefined;
    protected f32Array: Float32Array | undefined;
    protected buffer: GPUBuffer | undefined;
    protected stagingBuffer: GPUBuffer | undefined;
    protected byteSize: number;
    protected usage: GPUBufferUsageFlags;
    protected hasSetup: boolean;
    constructor(name: string, defaultValue: T);
    setup(autoWrite?: boolean): void;
    get gpuBuffer(): GPUBuffer;
    get schemaLayoutDescriptor(): BufferSchemaDescriptor<T>;
    protected toFloat32Array(value: T): Float32Array;
    protected fromF32Array(f32Array: Float32Array): T;
    protected updateBuffer(): void;
    set value(value: T);
    get value(): T;
    protected mapPending: boolean;
    read(from?: number, readLength?: number): Promise<T | null>;
}
export declare class ArrayUniform<T> extends Uniform<T[]> {
    protected elementSize: number;
    protected packedElementSize: number;
    constructor(name: string, defaultValue: T[]);
    setup(autoWrite: boolean): void;
    get schemaLayoutDescriptor(): BufferSchemaDescriptor<T[]>;
    protected toFloat32Array(value: T[]): Float32Array;
    protected fromF32Array(f32Array: Float32Array): T[];
    protected setArrayData(index: number, data: T): void;
    protected getArrayData(index: number, f32Array: Float32Array): T | null;
    readTo(index: number): Promise<T[]>;
    readElement(index: number): Promise<T | null>;
    updateBufferAt(index: number, data: T): void;
    protected updateBuffer(): void;
}
export declare class ColorUniform extends Uniform<Color> {
    constructor(defaultValue: Color);
    get schemaLayoutDescriptor(): BufferSchemaDescriptor<Color>;
    protected toFloat32Array(value: Color): Float32Array;
    protected updateBuffer(): void;
}
export declare class FloatUniform extends Uniform<number> {
    constructor(defaultValue: number);
    get schemaLayoutDescriptor(): BufferSchemaDescriptor<number>;
    protected toFloat32Array(value: number): Float32Array;
    protected fromF32Array(f32Array: Float32Array): number;
    protected updateBuffer(): void;
}
export declare class UintUniform extends Uniform<number> {
    constructor(defaultValue: number);
    get schemaLayoutDescriptor(): BufferSchemaDescriptor<number>;
    protected toFloat32Array(value: number): Float32Array;
    protected fromF32Array(f32Array: Float32Array): number;
    protected updateBuffer(): void;
}
export declare class Vec3Uniform extends Uniform<vec3> {
    constructor(defaultValue: vec3);
    get schemaLayoutDescriptor(): BufferSchemaDescriptor<vec3>;
    protected toFloat32Array(value: vec3): Float32Array;
    protected fromF32Array(f32Array: Float32Array): vec3;
    protected updateBuffer(): void;
}
