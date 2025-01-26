import "reflect-metadata";
import { ShaderDataType, ShaderTypes, StorageMode } from "./datatypes";
import { DynamicUniform } from "./dynamic-uniform";
export interface BufferSchema<T> {
    name: string;
    constructorName: string | null;
    uniform: boolean;
    array: boolean;
    maxInstanceCount: number;
    defaultValue?: T | T[];
    layout: ShaderDataType[];
    type: (new () => T) | keyof typeof ShaderTypes;
    structured: boolean;
}
export interface BufferSchemaDescriptor<T> {
    name: string;
    uniform: boolean;
    isArray: boolean;
    maxInstanceCount?: number;
    type: (new () => T) | keyof typeof ShaderTypes;
    storageMode: StorageMode;
    defaultValue?: T | T[];
}
export default class Compute {
    private bufferSchemas;
    private buffers;
    private mappedBuffers;
    private layout;
    private bindGroup;
    protected shader: string;
    private entryPoints;
    private computePipelines;
    private structCode;
    private bindingCode;
    ready: boolean;
    constructor(shader: string[], pipelines: string[]);
    private addBuffers;
    private addBuffer;
    init(): void;
    addComputePipeline(shader: string | GPUShaderModule, entryPoint: string): GPUComputePipeline;
    getBuffer<T>(name: string): DynamicUniform<T> | null;
    set<T>(name: string, value: T): void;
    setElement<T>(name: string, index: number, value: T): void;
    setPartialElement<T>(name: string, index: number, value: Partial<T>, autoUpload?: boolean): void;
    get<T>(name: string): Promise<T | null>;
    dispatchSingle(workgroups: GPUIndex32, pipeline: GPUComputePipeline): void;
    dispatch(workgroups: GPUIndex32): void;
}
